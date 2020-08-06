# 오라클 내장 함수
- [오라클 내장 함수](#오라클-내장-함수)
  - [1. 문자 함수](#1-문자-함수)
    - [REPLACE](#replace)
    - [SUBSTR](#substr)
  - [2. 날짜, 시간 함수](#2-날짜-시간-함수)
    - [TO_DATE, TO_CHAR](#to_date-to_char)
    - [날짜형 데이터](#날짜형-데이터)
    - [현재 날짜와 시간](#현재-날짜와-시간)
  - [3. NULL 값 처리](#3-null-값-처리)
    - [NVL](#nvl)
  - [4. 조건부 논리 표현식](#4-조건부-논리-표현식)
    - [CASE](#case)
    - [DECODE](#decode)
- [참고자료](#참고자료)

## 1. 문자 함수

### REPLACE
`REPLACE()`는 문자열을 치환하는 함수다. 대상 문자열의 지정한 문자를 원하는 문자로 변경할 수 있다.

```SQL
REPLACE(대상 문자열, 지정한 문자, 변경하길 원하는 문자)
```

```SQL
SELECT BOOKID, REPLACE(BOOKNAME, '야구', '농구') BOOKNAME, PUBLISHER, PRICE
FROM BOOK;
```

### SUBSTR
`SUBSTR()`은 문자열 중 특정 위치에서 시작하여 지정한 길이만큼의 문자열을 반환하는 함수다.

```SQL
SELECT SUBSTR(NAME, 1, 1) "성", COUNT(*) "인원"
FROM CUSTOMER
GROUP BY SUBSTR(NAME, 1, 1);
```

## 2. 날짜, 시간 함수
### TO_DATE, TO_CHAR
1. TO_DATE
문자형(CHAR) 데이터를 날짜형(DATE)로 반환한다.
```SQL
TO_DATE(CHAR, DATETIME)
```

```SQL
TO_DATE('2020-02-14', 'yyyy-mm-dd') -- 2014-02-14(DATE 타입)
```

2. TO_CHAR
날짜형(DATE) 데이터를 문자열(VARCHAR2)로 반환한다.
```SQL
TO_CHAR(DATE, DATETIME)
```

```SQL
TO_CHAR(TO_DATE('2020-02-14', 'yyyy-mm-dd'), 'yyyymmdd') -- '20140214'(VARCHAR2 타입)
```

```SQL
SELECT ORDERID "주문번호", TO_CHAR(ORDERDATE, 'yyyy-mm-dd dy') "주문일", CUSTID "고객번호", BOOKID "도서번호"
FROM ORDERS
WHERE ORDERDATE=TO_DATE('20200707', 'yyyymmdd');
```

### 날짜형 데이터
날짜형 데이터는 '-'와 '+'를 사용해 원하는 날짜로부터 이전(-)과 이후(+)를 계산할 수 있다.

```SQL
SELECT TO_DATE('2020-08-06', 'yyyy-mm-dd') + 5 AFTER,
        TO_DATE('2020-08-06', 'yyyy-mm-dd') - 5 BEFORE
FROM DUAL;
```

### 현재 날짜와 시간

- `SYSDATE`는 오라클 데이터베이스에 설정된 현재 날짜와 시간을 반환하는 함수다.
- `SYSTIMESTAMP`는 현재 날짜, 시간과 함께 초 이하의 시간과 서버의 TIMEZONE까지 출력해준다.


## 3. NULL 값 처리

### NVL
```SQL
NVL(속성, 값) -- 속성 값이 NULL이면 '값'으로 대치한다.
```

```SQL
SELECT NAME "이름", NVL(PHONE, '연락처 없음') "전화번호"
FROM CUSTOMER;
```

## 4. 조건부 논리 표현식
### CASE
ANSI SQL 표준 구문(표현식)이다.
1. 단순 비교(=) 처리 구문
```SQL
CASE 대상값 WHEN 비교값 1 THEN 처리1
            WHEN 비교값 2 THEN 처리2
            ...
[ELSE 디폴트 처리]
END
```

```SQL
SELECT EMPLOYEE_ID, NAME, JOB_ID, SALARY,
    CASE JOB_ID WHEN 'HR_REP' THEN 1.10 * SALARY
                WHEN 'MK_REP' THEN 1.12 * SALARY
                WHEN 'PR_REP' THEN 1.15 * SALARY
                WHEN 'SA_REP' THEN 1.18 * SALARY
                WHEN 'IT_PROG' THEN 1.20 * SALARY
    ELSE SALARY
    END "NEW SALARY"
FROM EMPLOYEES;
```

2. 검색 조건을 이용한 비교 처리 구문
```SQL
CASE WHEN 비교조건1 THEN 처리1
    WHEN 비교조건2 THEN 처리2
    ...
[ELSE 디폴트 처리]
END
```

### DECODE
`DECODE()`는 오라클 전용 함수다. DECODE 함수는 '='를 이용한 동등 비교 연산만 할 수 있고 검색형 조건 비교 처리는 불가능하다.

```SQL
DECODE (대상값, SEARCH1, RESULT1, SEARCH2, RESULT2, ..., DEFAULT RESULT)
```

```SQL
SELECT EMPLOYEE_ID, NAME, JOB_ID, SALARY,
    DECODE (JOB_ID, 'HR_REP', 1.10 * SALARY,
                    'MK_REP', 1.12 * SALARY,
                    'PR_REP', 1.15 * SALARY,
                    'SA_REP', 1.18 * SALARY,
                    'IT_PROG', 1.20 * SALARY,
                    SALARY) "NEW SALARY"
FROM EMPLOYEES;
```

# 참고자료
- 오라클로 배우는 데이터베이스 개론과 실습