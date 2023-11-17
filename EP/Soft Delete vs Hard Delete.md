[Soft Delete vs Hard Delete](https://abstraction.blog/2015/06/28/soft-vs-hard-delete#recommendation)


# Overview

Soft Delete는 '삭제'해야하는 열을 설정하여 update를 해주는 방식이다. 따라서 해당 테이블을 조회할 때, 기본적으로 `delete_flag = false`를 쿼리 조건에 추가해서 작업해야한다.
<table>
  <tr>
    <th>id</th>
    <th>name</th>
    <th>age</th>
    <th>delete_flag</th>
  </tr>  
  <tr>
    <td>1</td>
    <td>lee</td>
    <td>20</td>
    <td>false</td>
  </tr>
  <tr>
    <td>2</td>
    <td>kim</td>
    <td>30</td>
    <td>true</td>
  </tr>
  <tr>
    <td>3</td>
    <td>um</td>
    <td>40</td>
    <td>false</td>
  </tr>
</table>

Hard Delete는 테이블에서 실제로 데이터를 삭제하는 방법이다. 감사를 위해서 제거하는 연산이나 혹은 작업을 테이블에 추가하는 경우도 많다.

이 두 방식은 서로 장단점이 있다. 이 두 요소를 각각의 요소별로 비교해보자.

# 설정의 용이성

Hard Delete는 삭제할 데이터를 감사 테이블에 복사해야 하는 반면, Sofe Delete는 컬럼만 업데이트하면 되기 때문에 구현하기가 더 쉽다.

**Advantage: Soft Delete**

# 디버깅
소프트 삭제를 사용하면 deleted_flag로 인한 데이터 문제를 쉽게 디버깅할 수 있다.
그러나 감사 테이블을 통한 디버깅도 쉽게 가능하다.

**Advantage: N/A**

# 데이터 복원
소프트 삭제를 통해 '삭제된' 데이터를 복원하는 것은 deleted_flag를 설정 해제하기만 하면 되기 때문에 매우 쉽다.
그러나 데이터 복원은 극히 드문 경우이긴 하다.

**Advantage: Soft Delete**

# Active 데이터 쿼리
경험상 개발자가 선택 쿼리에 "deleted_flag = false" 조건을 추가하는 것을 잊어버렸을 때 많은 문제가 발생했으며, 이로 인해 문제가 발생할 수 있다.
'소프트 삭제' 플러그인이 활성화된 Doctrine과 같은 ORM을 사용하는 경우 ORM에서 이 검사를 추가하기 때문에 문제가 되지 않습니다.

**Advantage: Hard Delete**

# 단순성
테이블의 모든 데이터를 활성 데이터로 유지하는 것은 보기 단순성(WYSIWYG - 보이는 그대로 보기)과 관련이 있습니다.
하드 삭제에서는 모든 '삭제된' 데이터가 감사 테이블에만 존재하고 시스템의 나머지 테이블에는 '활성' 데이터가 있습니다. 따라서 하드 삭제에는 관심사의 분리가 되어있습니다.

**Advantage: Hard Delete**

# 작업 성능
업데이트가 삭제보다 약간 빠름(마이크로초)
따라서 소프트 삭제가 하드 삭제보다 기술적으로 더 빠릅니다(감사 테이블 삽입도 고려해야 함).

**Advantage: Soft Delete**

# 애플리케이션 성능

## 속도
소프트 삭제를 지원하려면 모든 선택 쿼리에 "WHERE deleted_flag = '0'" 조건이 있어야 합니다.
JOIN이 관련된 상황에서는 이러한 조건이 여러 개 있을 수 있습니다.
조건이 적은 선택 쿼리가 조건이 있는 쿼리보다 빠릅니다.

**Advantage: Hard Delete**

## 크기
더 빠른 소프트 삭제를 지원하려면 모든 테이블의 모든 deleted_flag에 대한 인덱스가 있어야 합니다.
또한 테이블에 '소프트 삭제된' 데이터 + 활성 데이터가 있기 때문에 테이블 크기가 계속 증가합니다.
테이블 크기가 증가하면 쿼리 속도가 느려질 수 있습니다.

**Advantage: Hard Delete**

# 데이터베이스 기능과의 호환성

## Unique Index
- 고유 인덱스는 데이터베이스 수준에서 행이 여러 번 발생하는 것을 방지하여 데이터 무결성을 보장합니다.
- 소프트 삭제를 사용하면 고유 인덱스가 사용되지 않습니다.

예:
필드 A와 필드 B, 삭제_플래그가 복합 고유 인덱스를 가지고 있습니다.
데이터 A1 및 B1이 있는 행이 '소프트 삭제'된 경우 고유 인덱스는 A1-B1-1(즉, deleted_flag) 값에 대한 것입니다.
테이블에 새 항목 A1-B1이 추가되면 고유 인덱스로 인해 다시 소프트 삭제할 수 없습니다.
또한 A1-B1의 이전 소프트 삭제 항목을 업데이트하면 일부 데이터를 다시 작성해야 하므로 기록된 데이터가 손실될 수 있습니다(예: 업데이트 날짜 시간 또는 다른 deleted_by 열이 있는 경우).

**Advantage: Hard Delete**

## 캐스케이딩
소프트 삭제의 경우 '삭제 시' 캐스케이딩을 사용할 수 없습니다.
대안은 deleted_flag를 추적하는 'UPDATE' 트리거를 생성하는 것입니다.

**Advantage: Hard Delete**

- http://stackoverflow.com/questions/2549839/are-soft-deletes-a-good-idea
- http://stackoverflow.com/questions/378331/physical-vs-logical-soft-delete-of-database-record/26125927#26125927



