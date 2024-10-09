# boto3를 활용한 Service Quota 모든 증설이력 확인하기

## 목적
동일한 형상으로 구성이 진행될 신규로 생성하는 계정에 Service Quota 변경 항목들을 동일하게 적용하는 것을 목적으로 둔다.

## 이슈사항
(1) Service Quota 항목에서는 90일 신청기록만 보여주기만 한다.

(2) Organization 소속으로 둘 경우 Quota request template을 활용할 수 있으나, 같은 Organization 소속으로 두지는 않을 계획이다. 그렇기에 해당 방법은 사용할 수 없다.
[+] https://docs.aws.amazon.com/servicequotas/latest/userguide/organization-templates.html

(3) 모든 이력을 보기 위해서는 Case Open 이력으로 찾아보는 방법밖에 없으며, 많은 이력으로 히스토리 기록을 일일이 찾기에는 실수가 발생할 수 있거니와 검증과 내용정리에 많은 시간이 소요된다.


## 해결방안
AWS에서 제공하는 Service Quota API를 활용하여 두 계정에 대한 Service Quota 정보들을 추출하고 이를 비교 대조하는 방안이다.
[+] https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/service-quotas.html

코드 로직은 다음과 같다.

(1) Account A = 기존 계정, Account B = 신규 계정(Quota 증설이력 없는 계정) 정의

(2) Account A(기존계정) Account B(신규계정) 에 대한 Service Quota 정보 이력 저장 및 크기 비교

(3) 비교 대조 및 차이나는 항목들 저장

※ O(3N)의 시간복잡도 발생, Account A만 저장하고 B를 탐색하면서 비교대조하는 로직일 경우 2N 시간복잡도 발생하나 Quota 수집 과정에서 누락된 정보가 발생했을 가능성이 있기에(모든 서비스 Quota 항목들에 대한 정보 수집이 되어야 하므로) Account A, Account B에 대한 저장 결과의 크기가 같은지 확인이 되어야 한다.


### 코드
```python
import boto3
import time

def get_all_service_quotas(quotas_client):
    all_quotas = {}

    paginator_services = quotas_client.get_paginator('list_services')
    all_services = []
    for page in paginator_services.paginate():
        all_services.extend(page['Services'])

    for service in all_services:
        service_code = service['ServiceCode']
        quotas_for_service = []

        retries = 0
        max_retries = 100
        delay = 5

        while retries < max_retries:
            try:
                paginator = quotas_client.get_paginator('list_service_quotas')
                for page in paginator.paginate(ServiceCode=service_code):
                    quotas_for_service.extend(page['Quotas'])
                    print(f"Collecting datas from {profile}")
                    time.sleep(1) #Rate limit exceed로 인한 추가

                all_quotas[service_code] = quotas_for_service
                break

            except quotas_client.exceptions.TooManyRequestsException:
                print(f"Rate limit exceeded for {service_code}. Retrying in {delay} seconds.")
                time.sleep(delay)
                retries += 1
                delay *= 2
            except Exception as e:
                print(f"Error fetching quotas for {service_code}: {e}")
                break

    return all_quotas

def compare_quotas(quotas_A, quotas_B):
    differences = {}
    for service, quota_list_A in quotas_A.items():
        if service not in quotas_B:
            differences[service] = quota_list_A
            continue

        quota_list_B = quotas_B[service]
        diff_quotas = []

        for quota_A in quota_list_A:
            matching_quotas = [q for q in quota_list_B if q['QuotaName'] == quota_A['QuotaName']]

            if not matching_quotas:
                diff_quotas.append(quota_A)
                continue

            quota_B = matching_quotas[0]
            if quota_A['Value'] != quota_B['Value']:
                diff_quotas.append(quota_A)

        if diff_quotas:
            differences[service] = diff_quotas

    return differences


if __name__ == '__main__':
    profiles = ['Account_A', 'Account_B']
    profile_A, profile_B = profiles[0], profiles[1]
    quotas_data = {}

    for profile in profiles:
        session = boto3.session.Session(profile_name=profile, region_name='us-east-1')
        quotas_client = session.client('service-quotas')
        quotas_data[profile] = get_all_service_quotas(quotas_client)

    services_A = set(quotas_data[profile_A].keys())
    services_B = set(quotas_data[profile_B].keys())

    if services_A != services_B:
        missing_in_A = services_B - services_A
        missing_in_B = services_A - services_B

        if missing_in_A:
            print(f"{profile_B} 에만 존재: {missing_in_A}")
        if missing_in_B:
            print(f"{profile_A} 에만 존재: {missing_in_B}")

        print("실행이 중지되었습니다.")
        exit(1)

    differences = compare_quotas(quotas_data[profile_A], quotas_data[profile_B])

    for service, diff_quota_list in differences.items():
        print(f"quotas {service} 변경 필요 항목:")
        for quota in diff_quota_list:
            print(f"  Quota Name: {quota['QuotaName']}, Value in Account_A: {quota['Value']}")
        print("\n")
