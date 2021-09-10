#소환사 전적 검색 Api만들기

```
Api를 만든 과정에 대한 글입니다.  
문제가 보인다면 바로바로 리뷰 부탁드립니다!  
```

일단 Api를 만들기 전에 해당 Api에 대한 디자인을 간단하게 만들었다.  
디자인을 생각하지 않고 만드니 내가 만들고자 하는 Api가 어떻게 사용되는지 감이 안왔기 때문이다.  

![](./images/summoner%20api%20picture.png)
<승리가 많은 부분을 잘라낸것이 아니라 평소 실력이 좋아서 승리가 많은겁니다>  

일단 소환사를 검색 하면 무조건 전적리스트 또한 가져오도록 하자고 생각 했기 때문에

소환사 객체가 전적리스틀 가져야 한다고 생각했다.  

일단 테스트 코드를 작성하고 
```java

@SpringBootTest
class SummonerServiceTest {
    @Autowired
    SummonerService summonerService;

    @Test
    void save() {
        String name = "큰고모부";

        Summoner summoner = summonerService.getSummoner(name);

        assertThat(summoner.getSummonerName()).isEqualTo("큰고모부");
    }
}
```
소환사 정보와 소환사 전적 Entity를 만들었다.  
```java
@Entity
@Data
public class Summoner {
    @Id @GeneratedValue
    @Column(name = "summoner_id")
    private long id;

    private String summonerName;

    private String puuid;

    private int profileIcon;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "summoner_id")
    private List<MatchReference> matchReferences;

    public Summoner(String summonerName, String puuid, int profileIcon, List<MatchReference> matchReferences) {
        this.summonerName = summonerName;
        this.puuid = puuid;
        this.profileIcon = profileIcon;
        this.matchReferences = matchReferences;
    }

    public Summoner() {

    }

    public static Summoner of(SummonerDto summonerDto, List<MatchReference> matchReferences) {
        return new Summoner(summonerDto.getName(), summonerDto.getPuuid(), summonerDto.getProfileIconId(), matchReferences);
    }
}

@Entity
public class MatchReference {
    @Id @GeneratedValue
    @Column(name = "match_id")
    private long matchId;

    private long gameId;

    private String role;

    private int championId;

    private String lane;

    private Date timestamp;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "summoner_id", insertable = false, updatable = false)
    private Summoner summoner;

    public MatchReference(long gameId, String role, int championId, String lane) {
        this.gameId = gameId;
        this.role = role;
        this.championId = championId;
        this.lane = lane;
    }

    public MatchReference() {

    }

    public static List<MatchReference> of(MatchListDto matchListDto) {
        List<MatchReferenceDto> matchReferenceDtos = matchListDto.getMatches();
        return matchReferenceDtos.stream()
                .map(e -> new MatchReference(e.getGameId(), e.getRole(), e.getChampion(), e.getLane()))
                .collect(Collectors.toList());
    }
}
```
소환사 정보를 가지고 있는 Entity와 소환사 전적리스트에 대한 정보를 가지고 있는 Entity를 만들었다.  
자바 ORM 표준 JPA 프로그래밍 책에서 일대다 양방향 Mapping을 보고 설정 했는데.  
사실 생각해보면 일대다 단방향 Mapping이 맞다고 생각이 들었지만 일대다 단방향 Mapping보단 다대일 양방향Mapping을 하라고 적혀 있었다.  
그런데 한명의 소환사 가 여러 전적 리스트를 가지고 있고 주체가 소환사 이기 때문에 일대다 가 맞다고 생각했고, 일대다 단방향을 추천하지 않으니 양방향으로 일단 설정해놓고, JPA를 좀 더 알아보고 수정 해야 겠다고 생각 했다.  


Controller, Service, Repository를 만들었다.

```java

@RestController
public class SummonerController {
    public final RiotApi riotApi;
    public final SummonerService summonerService;
    
    public SummonerController(RiotApi riotApi, SummonerService summonerService) {
        this.riotApi = riotApi;
        this.summonerService = summonerService;
    }

    @GetMapping("/summoners/{summonerName}")
    public Summoner getSummoner(@PathVariable String summonerName) {
        return summonerService.getSummoner(summonerName);
    }
}

@Service
public class SummonerService {
    private final RiotApi riotApi;
    private final SummonerRepository summonerRepository;

    public SummonerService(RiotApi riotApi, SummonerRepository summonerRepository) {
        this.riotApi = riotApi;
        this.summonerRepository = summonerRepository;
    }

    public Summoner getSummoner(String summonerName) {
        if (summonerRepository.existsBySummonerName(summonerName)) {
            return summonerRepository.findBySummonerName(summonerName);
        }
        SummonerDto summonerDto = riotApi.getSummoner(summonerName);
        MatchListDto matchListDto = riotApi.getMatches(summonerDto.getAccountId());

        return summonerRepository.save(Summoner.of(summonerDto, MatchReference.of(matchListDto)));
    }
}

@Repository
public interface SummonerRepository extends JpaRepository<Summoner, Long> {
    boolean existsBySummonerName(String summonerName);

    Summoner findBySummonerName(String summonerName);
}
```

## 회고
간단한 Api작업이라고 생각했지만 아쉬운것은 많았다.
일단 퀄리티가 별로다.  
아쉬운것을 정리 해보면  
1. Jpa에 대해서 잘모른다.  (공부할건 많은데 너무 생각 없이 지냈구나..)
2. Rate Limit를 해결 하지 못했다.  
3. 내가 만든 Api가 어떻게 작동하는지 세세하게 모른다.  

이 세 부분이 아쉬웠다.  
혼자 하는것이 쉽지 않다는 것을 알고 있었지만.  
이렇게 까지 비효율적 일거라고 생각하지 못했다.  
내 자신에게 좀 아쉬운게 많았다.  

취업에 성공 했지만 취업에 성공하는 동안 충분히 깊게 생각해보고 나름 견고 하게 설계 할 수 있었을 텐데 그러지 못한건 아쉬운것 같다.  

