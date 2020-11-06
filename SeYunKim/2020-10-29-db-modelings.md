# 개념 모델 vs 논리모델 vs 물리모델

## 개념 모델이란?

![nosql-vs-rdbms-2](https://github.com/ksy90101/TIL/blob/master/database/image/db_modelings_1.png?raw=true)

- 데이터 모델의 첫 단계로 고객의 요구사항을 수집, 분석해 전체적인 모양을 결정짓습니다.
- 이 단계에서는 전체 모델에서 중요한 골격이 되는 엔티티와 관계 위주로 모델링이 됩니다.
- 엔티티, 관계 위주의 모델링을 통해 전반적인 골격을 파악하는데 중점을 두기 때문에 데이터 모델의 속성 표현을 불필요할 수도 있습니다.
- 사용자가 요구하는 데이터의 범위 및 구조를 용이하게 확인이 가능하며 사용자와 함께 검토를 통해 신규 시스템에 해당 요구사항을 반영할지 여부를 결정하여 개발범위를 정하는데도 도움을 줍니다.

## 논리 모델이란?

![nosql-vs-rdbms-2](https://github.com/ksy90101/TIL/blob/master/database/image/db_modelings_2.png?raw=true)

- 데이터베이스 설계 프로세서의 Input으로 비지니스 정보의 구조, 규칙등을 명확하게 표현해야 합니다.
- 즉, 데이터 모델링이 최종적으로 완료되어 물리적인 스키마 설계를 하기 전단계의 데이터 모델 상태입니다.
- 이때 핵심은 누가, 어떻게 데이터에 접근하는지 등에 대한것 입니다.
- 아울러 논리 모델은 모델중에 가장 핵심이 됩니다.

## 물리 모델이란?

![nosql-vs-rdbms-2](https://github.com/ksy90101/TIL/blob/master/database/image/db_modelings_3.png?raw=true)

- 논리적 모델을 특정 데이터베이스로 설계함으로써 데이터를 저장할 수 있는 물리적인 스키마를 말합니다.
- 즉, 논리 모델을 각 DBMS의 특성에 맞게 데이터 베이스 저장 구조(물리 데이터 모델)로 변환하는 것입니다.
- 많은 사람들이 단순히 설계된 논리 데이터 모델의 개체 명칭이나 속성 명칭, 데이터 형태, 길이, 영역값등을 변환하는 것으로만 생각하지만, 실제 저장 공간, 분산, 저장 방법 등까지도 고려해야 합니다.

## 참고자료

[데이터 전문가 지식포털 DBGuide.net](http://www.dbguide.net/db.db?cmd=view&boardUid=12827&boardConfigUid=9&categoryUid=216&boardIdx=37&boardStep=1)
