# lolapi
lol stat website using lol api

default branch main


# app features(pages)
1. Home (Search summoner name)
2. Summoner's stat
    - Worst counters against my champions
        - win rate for each enemy champion met
    - Best partners of my champions
        - Best mid/top - jg combination
        - Best ad - sup combination
    - items that worked best for my champions
    - the most common enemy that I met against my champions

[ ] MVC settings
[ ] fetch lolapi data and show it on view
[ ] build routers
[ ] design in detail

# ideas
 - milliseconds to date gogo
 - winrate with friends? 
    - e.g. 
        - what's your account? 
        - what's your friend's account? 
        - what's the winrate when you play with this friend?
- namtat.gg
    - worst, best allies when you play mid/top/jg/ad/sup
    - worst, best enemies "
- monster.gg (괴물쥐쥐)

# Questions & Problems
1. can I res.render an html file? (instead of using pug as view engine)
2. when using fetch, summoner name is included in url. the problem is, if the name is in korean, error occurs. 
    - ==> URLs can only be sent over the Internet using the ASCII character-set, so the problem occurs because korean characters are converted into ASCII format.
    - use encodeURI() function?
3. matchilist data를 api에 요청하는 방식에 대한 고민 - 일단은 2번 방법으로 진행중. 
    1. champion별로 나눠서 하기:
        - 장점: 
            - played champion마다 matchlist를 따로 관리할 수 있도록 한번에 구현할 수 있다. 
        - 단점:
            - api에 user가 play한 챔피언마다 matchlist를 각각 요청해야 하므로 요청횟수가 챔피언 갯수 배 만큼 증가할 것이다. 
            - riot api는 api key마다 요청횟수에 제한이 있다고 한다. 요청횟수가 늘어서 좋을 것이 없다. 
    2. user의 모든 matchlist를 한번에 요청한 후 필요에 따라 내가 직접 분류하기. 
        - 장점:
            - user의 모든 matchlist를 한번에 요청하기 때문에 api에 user당 한번만 matchlist를 요청하면 된다. 
        - 단점:
            - 경우에 따라 내 앱의 연산작업이 늘어날 것이다. (어느 정도로?)
4. 단순히 key-value 자료형인 해시맵을 쓰기 위해서 Map으로 championRecords와 encounteredChampionsList를 구현한건데 이게 성능적인 이점이 있는건가? 왜 일반 Object쓸 생각을 안했지? 일반 Object와 Map의 탐색(get) time complexity 알아보자. 
# logs
### 3rd Aug 2021. TUE
 - the maximum matchlist range allowed for one query is 100
    - e.g. if you played tf for 431 games, then you need to execute 5 queries in total to cover all 431 games. (0-100, 100-200, 200-300, 300-400, 400-432)
    - lol api matchlist index range seems it doesn't count the endIndex.
        - which means that if startIndex(beginIndex): 0 and endIndex: 100, then it actually shows the list from 0 to 99, excluding the 100. 
        - so if you want a list of 100 matches from 0 to 99, then you need to input 0 for startIndex(beginIndex) and 100 for the endIndex. 

### 3rd Sept 2021. FRI
 - subdocument써보고 싶었는데 subdocument형식으로 Map type을 연결하는 방법을 알지 못해서 어쩔 수 없이 ChampionRecord Schema를 하나더 만들어서 ObjectId/ref 방법을 이용했다. 
    - 그래도     
    championRecords: {
        type: Map,
        of: { type: mongoose.Schema.Types.ObjectId, ref: "ChampionRecord"}
    } 
    방법을 알아낸 것은 좋았다.
### 4th Sept 2021. SAT
 -  winrate with/against 해야함. 
 -  이후 frontend 기능 구현해야함
    - 아이디 이름으로 검색 / 버튼으로 data process 실행되도록. 
 - 라이엇에 샘플 보내서 api 받아야 하고. 그 전에 시간차 api request해서 최대한 내 계정으로 data proess해보자. 도파걸로도 해볼까. 
 - 샘플 보내려면 publish까지 완료 되어있어야 하는건가? 그럴려면 좀 빡센데 .. 
 - webpack / publish작업 할때는 git branch 분기해서 작업하도록 하자. 그전에 웹사이트 자체는 거의 끝내놔야 함. 
### 8th Sept. 2021. WED
 - processData를 유저 최초 검색시에 실행되도록 위치를 바꿨음. 
 - winrate 처리 / 저장했음. 
    - winrate 처리코드를 함수로 만듬. 다른 코드들도 쪼개서 정리할 필요 있을듯. 가독성이 없어서 며칠만에 봤는데도 무슨 코드인지 파악하는데 한참걸림...
 - 지금 User가 ChampionRecord를 populate하긴 하는데 ChampionRecord Schema가 User에 연결되어 있다는 사실을 깨달음. 해야하는 이유가 있나? 일단 보류.
    - 유튭 클론코딩할때는 User와 Video가 서로 연결되어 있었음. (Objectid, ref)
 - 이제 frontend 해야함. 

### 15th Sept. 2021. WED
 - user.populate("championRecords")를 해주어야 render로 view에 user전달할때 championrecord부분이 구현이 됨. 이부분 확실히 이해하게 됨. (schema정의 시에 ref 해놓은 덕분이라는 점)
 - 소환사데이터 화면에 어떤 데이터를 어떤 식으로 어떤 순서로 보여줄지 계획/대충구현 해봤음. 
    - op.gg같은거 보면 사용자가 표를 조작하면서 원하는 속성?으로 표 개체들을 재정렬 할 수 있도록 되어 있는데. 나도 그렇게 하는게 좋을듯. 
    - 검색해보니 html table과 aria? 로 구현할 수 있는듯 하다. html파일 따로 만들어서 연습해본 후 pug로 적용해보자. 

### 16th Sept. 2021. THU
 - 해야할일 정리해보자.
 1. 

# algorithm
1. get username from the user. (search)
2. get encrypted accountId
3. use the id to get matchlists for 156 champions
    - save the matchlists info of the user.
    - in js array of objects format 
    - e.g. userMatchlists = [ 
        { 
            id: 4, 
            played: true, 
            matchIdList: [343543, 344354, 13241, 45324, ... ], 
        },
        { id: 266, played: no, matchIdList: [], ... },
        ...
        {}
    ]
4. analyze and calculate played-champions records & winrates and save them
    - e.g.
    - userRecords_championsPlayed: [
        {
            id: 4,
            numOfTimesPlayed: 431,
            encounterList:
                [
                    {
                        id: 266,
                        played: true,
                        playedAgainst: 15,
                        playedWith: 21,
                        winAgainst: 6,
                        winWith: 11
                        winRateAgainst: 0.4,
                        winRateWith: 0.5238095238
                    },
                    {
                        id: 2,
                        ...
                    },
                    ...
                ]
        },
        {
            id: 91, 
            numOfTimesPlayed: 124,
            encounterList: [...]
        },
        ...
      ]
5.  show it to user (render on website)

# algorithm ( from api to db )
1. get valid API key
2. get username (by search in real app)
3. get encrypted account id from username
    - create and save User model data ( 
        username, encrypted account id, level, avatar info, 
        matchlist array(
            => normal js array of objects, and the object contains matchId, championId, and timestamp), 
        championRecords array(
            => array of subdocuments/childrenSchemas the subdocument called championRecord will contain championId, numOfTimesPlayed, and encounteredChampionsList(
                which is again, an array of object, encounteredChampion, which will contain id, playedAgainst, playedWith, winAgainst, winWith, winRateAgainst, and winRateWith 
        ) 
    ) and etc.
4. get matchlist data from the encrypted account id
    - save them in the array in the User object
5. iterate the matchlist, and get match data from the matchId 
    - => this will result in many many requests.
6. with each match data, create(if there isn't one yet) and update the championRecord objects(and should create and update the encounteredChampion object inside). 

# algorithm ( from db to user(view) )

# concepts learned (새로써본 것들)
 - JS map? (hash map)
 - mongoose Map Type
 - mongoose subdocument
 - JS .find(x => x.key == value)  method. 
    - e.g. if(matchData.teams.find(team => team.teamId == 100).win == "Win")

 - 15th Sept
    - Object.fromEntries(a_Map) 로 Map자료형을 Object로 convert할 수 있다. 
    - mixin inside a mixin 가능하다. 
    - 

# concepts that i want to learn more 
1. JS basic syntax and ES6 syntax
2. promise then / async await
3. mongoose / mongodb 기본기
    - fields? documents? types? schema?
    - when to use Subdocument
    - how to update subdocument values of a data object
    - and when to use Schema.Types.ObjectId ( how are the two different? )