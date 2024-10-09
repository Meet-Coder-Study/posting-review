# DTO에서의 setter 사용
DTO에서 데이터 바인딩을 위해 롬복의 @Data 어노테이션을 사용하거나 getter, setter를 무분별하게 사용할 때가 있습니다.   
하지만 setter의 무분별한 사용은 변경하면 안되는 값을 변경 가능하다고 착각하게 하여, 안정성이 보장되지 않습니다.   
이는 곧 캡슐화의 위배로 이어질 수 있습니다.     
하지만 setter를 붙이지 않으면 데이터 바인딩이 제대로 작동하지 않을 때가 있습니다. 이를 자세히 알아보겠습니다.    
## @RequestBody
@RequsetBody으로 데이터를 역직렬화할때
1. Jackson은 getter, setter 메서드의 이름을 가져와서
2. 해당 메서드 이름에서 get, set을 제거한 후
3. 제거된 이름의 첫글자를 소문자로 변경
   과정을 통해 filed에 접근한다

실제 데이터의 주입은 java.lang.reflect를 통해 주입하기 때문에   
getter, setter 둘 중 하나만 있으면 됩니다.  

## @ModelAttribute
@ModelAttribute의 경우 setter를 사용해 값을 객체에 주입할 수 있습니다. 
하지만,  
파라미터 갯수가 0개인 기본 생성자가 있다면 인스턴스를 생성 후, setter로 바인딩하지만   
그렇지 않다면 필드에 맞는 파라미터를 가진 생성자로 바인딩됩니다.      
따라서 @AllArgsConstructor로 모든 필드를 매개변수로 만드는 생성자를 사용하면 setter를 사용하지 않을 수 있습니다.   

## DTO를 @RequestBody와 @ModelAttribute 모두 사용하고 싶을때?
하나의 DTO 클래스를 @RequestBody와 @ModelAttribute 모두 사용한다고 가정하겠습니다.      
이 때 @RequestBody는 빈 생성자로 객체를 생성한 뒤 값을 주입하기 때문에,    
DTO에 빈 생성자를 만들면 @ModelAttribute 방식으로 바인딩할때, 빈 생성자로 인스턴스를 생성 후 setter로 바인딩하게 됩니다.    
이때 setter를 사용하지 않는다면 오류가 발생하게 됩니다.  
이럴 때는 기본 생성자 범위를 private으로 작성하여 해결할 수 있습니다.  
```java
@Getter
public class VoucherWebCreateRequestDto {
   private Integer discount;
   private VoucherDiscountType voucherDiscountType;
   
   private VoucherWebCreateRequestDto(){}

   public VoucherWebCreateRequestDto(Integer discount, VoucherDiscountType voucherDiscountType) {
      this.discount = discount;
      this.voucherDiscountType = voucherDiscountType;
   }
}
```
