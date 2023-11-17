# 스프링 이벤트 적용기
주식 거래 시스템을 주제로 개인 프로젝트를 진행하고 있습니다.  
이때 주식은 장의 개념이 있어 특정 시간 이외에는 매수, 매도를 할 수 없어 예약 주문 기능이 존재하는데,  
이를 프로젝트에서 간단하게 구현해보고자 하였습니다.
## 발단
먼저 스케줄러를 만들어 일정 시간마다 예약 주문 테이블과 매수 테이블을 탐색하여 조건이 맞을 경우, 매수해주도록 구현하고자 했습니다.  
다만 스케줄링을 통해 구현한다면 실시간으로 급격하게 가격이 변동되는 주식의 특성과 맞지 않다고 생각하여, 매도 시 이벤트 발급을 통해 예약 주문이 처리되도록 구현하였습니다.    
## Spring Event
spring-boot-starter-web에 내장된 기능입니다. 
ApplicationEventPublisher로 이벤트를 발급하고,   
```java
@Autowired
private ApplicationEventPublisher eventPublisher;

public void sellOrder(TradeSellRequestDto tradeSellRequestDto) {
    memberStock.sellStock(tradeSellRequestDto.quantity());
    Trade trade = Trade.builder().stock(memberStock.getStock()).quantity(tradeSellRequestDto.quantity()).build();
    tradeRepository.save(trade);

    // 이벤트 발급
    eventPublisher.publishEvent(new SellTradeEvent(trade));
}
```
@EventListener 어노테이션을 통해 이벤트 디스패처가 해당 메소드에 publish할때 담은 POJO(순수 자바객체, 여기선 SellTradeEvent)를 전달합니다.   
```java
@EventListener
public void sellEventListener(SellTradeEvent event){
    Trade trade = event.getTrade();

    // trade 보다 주문 수량이 적고, 주문 가격이 높은 buyReserve 를 가져온다
    buyReserveCustomRepository.findBuyReserveByStockAndPrice(trade.getStock(), trade.getPrice(), trade.getQuantity())
            .ifPresent(buyReserve ->
            {
                TradeBuyRequestDto tradeBuyRequestDto = new TradeBuyRequestDto(buyReserve.getPrice(), buyReserve.getQuantity(), buyReserve.getMember().getId(), trade.getId());
                tradeService.buyOrder(tradeBuyRequestDto);
                buyReserveRepository.delete(buyReserve);
            });
}
```
여기서는 매도 이벤트를 수신하면 예약 매수 테이블을 탐색하여 조건이 맞는 엔티티가 존재할 경우, 매수 주문을 성사시키도록 구현해주었습니다.
### 보완점
스프링에서 간단하게 이벤트를 통해 예약 매수 기능을 구현할 수 있었습니다.   
다만 예약 주문 처리가 오래 걸리면 다른 기능에도 장애를 줄 수 있겠다는 생각이 들었습니다.     
따라서 예약 주문 도메인을 일반 주문 도메인과 분리한 뒤, 메시지 큐로 연결한다면 의존성을 줄이고 비동기적으로 처리하도록 개선할 수 있을 것 같습니다.

