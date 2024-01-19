마틴 파울러(Martin Fowler)의 저서 "리팩토링 2판: 코드 구조를 체계적으로 개선하여 효율적인 리팩터링 구현하기"를 읽고 공부한 내용을 기록했습니다. (책에 나온 javascript 예시를 typescript로 변환했습니다.)

# Chapter 01 리팩터링: 첫 번째 예시

- 프로그램이 새로운 기능을 추가하기에 편한 구조가 아니라면, 먼저 기능을 추가하기 쉬운 형태로 리팩터링하고 나서 원하는 기능을 추가한다.
- 리팩터링의 첫단계
  : 리팩터링하기 전에 제대로 된 테스트부터 마련한다. 테스트는 반드시 자가진단하도록 만든다.
- 리팩터링은 프로그램 수정을 작은 단계로 나눠 진행한다. 그래야 중간에 실수하더라도 버그를 쉽게 찾을 수 있다.
- 긴 함수를 리팩터링할 때는 먼저 전체 동작을 각각의 부분으로 나눌 수 있는 지점을 찾는다.
- 별도 함수로 빼냈을 때 유효범위를 벗어나는 변수, 즉 새 함수에서는 곧바로 사용할 수 없는 변수가 있는지 확인한다.
- 있다면, 이 변수를 초기화하는 코드와 함께 해당 값을 반환하도록 작성한다.
- 수정하고 난 후 곧바로 컴파일하고 테스트해서 실수한게 없는지 확인한다
- 임시 변수들은 로컬 범위에 존재하는 이름이 늘어나서 추출 작업이 복잡해 지기 때문에 최대한 제거 한다.
- 지역 변수를 제거해서 얻는 가장 큰 장점은 추출 작업이 훨씬 쉬워진다는 것이다.
- 코드가 복잡할수록, 단계를 작게 나누어 작업하고 커밋을 자주 하자.

---

#### [요약]

1. 반복문 쪼개기 : 변수 값을 누적시키는 부분을 분리한다.
2. 문장 슬라이드 하기 : 변수 초기화 문장을 변수 값 누적 코드 바로 앞으로 옮긴다.
3. 함수 추출하기 : 적립 포인트 계산 부분을 별도 함수로 추출한다.
4. 변수 인라인하기 : 추출한 함수를 이용해 변수를 제거한다.

---

#### [리팩토링 전]

```typescript
import { I_PLAYS } from "../../interfaces/play";
import { I_INVOICES } from "../../interfaces/invoice";

function Statement(invoice: I_INVOICES, plays: I_PLAYS): string {
  let totalAmount: number = 0;
  let volumeCredits: number = 0;
  let result: string = `청구 내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let thisAmount = 0;

    switch (play.type) {
      case "tragedy": // 비극
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case "comedy": // 희극
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르 : ${play.type}`);
    }

    //포인트를 적립한다.
    volumeCredits += Math.max(perf.audience - 30, 0);
    if (play.type === "comedy") volumeCredits += Math.floor(perf.audience / 5);

    //청구 내역을 출력한다.
    result += `  ${play.name} : ${format(thisAmount / 100)} (${
      perf.audience
    }석)\n`;
    totalAmount += thisAmount;
  }
  result += `총액 : ${format(totalAmount / 100)}\n`;
  result += `적립 포인트 : ${volumeCredits}점\n`;
  return result;
}

export { Statement };
```

#### [리팩토링 후]

```typescript
import { I_PLAY, I_PLAYS } from "../../interfaces/play";
import { I_INVOICE_PLAY, I_INVOICES } from "../../interfaces/invoice";

function Statement(invoice: I_INVOICES, plays: I_PLAYS): string {
  function AmountFor(perf: I_INVOICE_PLAY, play: I_PLAY): number {
    // 값이 바뀌지 않는 변수는 매개변수로 전달
    let thisAmount = 0; // 변수를 초기화 하는 코드

    switch (play.type) {
      case "tragedy": // 비극
        thisAmount = 40000;
        if (perf.audience > 30) {
          thisAmount += 1000 * (perf.audience - 30);
        }
        break;
      case "comedy": // 희극
        thisAmount = 30000;
        if (perf.audience > 20) {
          thisAmount += 10000 + 500 * (perf.audience - 20);
        }
        thisAmount += 300 * perf.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르 : ${play.type}`);
    }

    return thisAmount; // 함수 안에서 값이 바뀌는 변수 반환
  }

  let totalAmount: number = 0;
  let volumeCredits: number = 0;
  let result: string = `청구 내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play: I_PLAY = plays[perf.playID];
    let thisAmount: number = AmountFor(perf, play);

    volumeCredits += Math.max(perf.audience - 30, 0);
    if (play.type === "comedy") volumeCredits += Math.floor(perf.audience / 5);

    result += `  ${play.name} : ${format(thisAmount / 100)} (${
      perf.audience
    }석)\n`;
    totalAmount += thisAmount;
  }
  result += `총액 : ${format(totalAmount / 100)}\n`;
  result += `적립 포인트 : ${volumeCredits}점\n`;
  return result;
}

export { Statement };
```
