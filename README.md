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
    - 당연히 될듯?
2. when using fetch, summoner name is included in url. the problem is, if the name is in korean, error occurs. 
    - ==> URLs can only be sent over the Internet using the ASCII character-set, so the problem occurs because korean characters are converted into ASCII format.
    - use encodeURI() function?
    - api fetch를 할때 url을 사용하게 되는데 소환사 이름이 한글일 경우 url encode를 한 값을 넣어야 함. 
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
            - 경우에 따라 내 앱(서버)의 연산작업이 늘어날 것이다. (어느 정도로?)
4. 단순히 key-value 자료형인 해시맵을 쓰기 위해서 Map으로 championRecords와 encounteredChampionsList를 구현한건데 이게 성능적인 이점이 있는건가? 왜 일반 Object쓸 생각을 안했지? 일반 Object와 Map의 탐색(get) time complexity 알아보자. 
    - 일반 object의 경우는 각각의 property안에 다른 종류의 값들이 있을것이라고 기대하고 만드는 자료형인 반면
        - e.g. car object면 modelName, price, color, materials, 뭐 이런 여러가지 property를 가질 수 있겠지
    - map의 경우에는 같은 자료형의 element를 여러개 보관하고 싶은데 이름을 지어서 보관하고 싶을때 사용하는 느낌인거 같다. 그렇기 때문에 object의 용도와는 다른거 같음. 확실히 map을 쓰는게 의미상으로(semantically) 자연스러운듯? 
        - e.g. car map이면 "myCar": "yellow", "yourCar": "red" 뭐 이런식으로 같은 종류지만 다른 이름과 내용을 보관할때. 즉 내가 원하는 encounteredChampionsList나 champioinRecords는 맵을 쓰는게 맞다. 근데 성능상 차이는 있는지 궁금하긴 하네.
5. 함수는 한개의 동작만 하는 것이 좋다고 주워 들은 적이 있어서 그렇게 하고 있었는데.
    - processWinrate과 updateMostEncountered함수는 db의 같은 내용을 사용하기 때문에 한번 접근할때 두개를 동시에 처리하는게 성능상으로는 좋을 거 같은데
    - 오직 가독성 / 유지보수 때문에 따로 관리를 하는 건가? 어떤게 더 나은 코드일까?
6. 롤api요청 앱을 만들때 db를 쓰는 이유가 뭐지? 내가 원하는 스키마로 데이터를 관리/사용하기 위함인가? 예를 들어서 유튜브는 자기네 앱에 사람들이 동영상을 업로드 하는거니까 당연히 자기네들이 알아서 동영상 정보를(동영상 파일 말고) 저장/관리 해야겠지만 롤 통계 앱 같은 경우에는 라이엇 api에 모든 정보가 다 있고 그걸 가져다가 가공해서 서비스하는건데 반드시 db가 있을 필요가 있을까?
    - 매번 api에 요청하는거랑 db에서 가져오는거랑 서버 부담은 별 차이가 없지 않나?
    - 게다가 db저장하면 db비용이 또 발생할거 아닌가?
    - 내맘대로 스키마 관리 할 수 있다는게 가장 큰듯?
    - 그럼 관리 / 개발 편의성을 위한건가? 성능 때문이 아니라?
    - 아닌가 예를들어서 매치리스트 요청해서 매번 그때그때 통계값 계산 하고 그러려면 결국에는 어떤 container안에 데이터를 다 보관해야 할텐데 그 작업량이나 데이터는 서버에게 맡기기에는 너무 많을수도. 게다가 새로고침이라도 하면 다시 처리해야되겠네. 새로고침의 경우는 확실히 비효율이 맞는듯. db에 저장해뒀으면 불러오기만 하면 되는데. 
7. 성능을 어떻게 테스트하지?
    - 예를 들어서 map자료형을 쓸 때와 object로 할 때, 두가지 경우의 데이터 처리 시간을 비교하고 싶으면 어떻게 해야 하지. 
    - morgan 같은 logger에 표시되는 응답 시간을 신뢰할 수 있나? 이럴때 쓰라고 있는건가??


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
### 17th Sept. 2021. THU
 - db에 챔피언은 전부 championId로 저장해 놓았기 때문에 view에서 쓰려면 championId를 가지고 필요한 정보들을 불러와야 한다
    - 예를들면 챔피언 한글 이름을 불러와서 페이지에 표시해주어야 하고
    - ddragon url로 챔피언 이미지 등을 가져오려면 영어 이름도 알아야 한다. 
 - 근데 문제는 이 json은 여러번 요청하는건 비효율인데. 그럼 어떻게 처리해주어야 하지? app시작할때 한번만 request해서 어디 저장해놓는 방식으로 해야하나? 
 - 그냥 json으로부터 object를 만들어서 물리적인 js파일로 저장해두고 쓰는게 가장 효율적일지도?
    - 이러면 패치때만 업데이트 해주면 됨. 

 - 일단 로컬에 있는 json파일을 import로 불러오면 object형식으로 자동으로 읽힌다는 것을 알게 되었음.
    - 괜히 fs.readFile, JSON.parse() 쓴다고 뻘짓했다.
 - summoner 페이지가 라우터에 요청되면. json을 불러와서 불러온 json내용을 championid(숫자)를 key로, array를 value로 가지는 object로 새롭게 처리해서 render로 넘겨주는 방식을 취함.
    - 즉 view pug안에서 championId(숫자)로부터 champion이름 등을 불러올 수 있게 처리해 놓은 것. 
    - array안에는 ddragon asset불러올때 쓰이는 챔피언 이름(asset이름으로 쓰이기 때문에 띄어쓰기 포함), 챔피언 영어이름(띄어쓰기 포함), 챔피언 한글이름, 이 세가지가 있음. 
    - summoner페이지를 불러올때마다 이 object처리를 해주어야 하는게 비효율이긴 함. O(numOfChampion)의 시간복잡도. 
        - 한번만 처리해서 이 object를 외부 js파일에 저장해버릴까? 그게 낫겠다.

 - 이제 해야할일 정리해보자.
 1. 요청시간 제한 걸어서 소환사의 전체 match 처리할 수 있게. 코드 작성/돌려보기.
    - 제출할때는 작동이 되는걸 보여주기 위해서 다시 10~50개 match만 처리하도록 바꿔서 제출하자.
    - 시험삼아 50개정도 해보는데. 이게 50개도 많네. 1분안에 두명 검색하면 요청 제한 초과해버림.
 2. front-end: css / js
 3. 배포
 4. 라이엇에 api승인받기.
 5. 최종배포.
 ### 23rd Sep. 2021, THU
  - notable enemies/allies(friends) 기능 구현함. db를 순회하는 식으로 했음.
  - aria는 특수한 목적이 있는 놈이란걸 알게됨. 스크린리더?랑 관련된거라고 함.
  - 결국 interactive table을 만들기 위해서는 html table태그들과 js(eventlistener)를 이용해야 함. 
    - https://www.delftstack.com/ko/howto/javascript/javascript-sort-html-table/
    - 여기 링크에서 기본 소스를 찾음.
    - 여러개 테이블을 모두 선택하여(querySelect) js를 각기 적용하는데 어려움을 겪었는데(각각의 테이블이 자기들끼리 잘 sort되도록 기능구현을 해야함) forEach방식으로 해결했음. 
    - 태그들을 array형태로 저장해서 sort비교 시킬 수 있다는 사실을 알게됨. 물론 비교함수(comparer)도 만들어 줘야 하지만
 ### 25th Sep. 2021, SAT
  - winRate을 표에서 js로 sort할때 50%가 100%보다 더 먼저오는 버그가 있다. 
    - 원인 추측: %를 붙이다 보니 string취급이 되고 string상으로 descending order일때 첫글자인 5가 1보다 크기 때문에(bx가 axx보다 먼저 오는 것을 생각하면 된다) 그렇게 되는거 같다. 
    - 근거: %를 제거하고 정렬을 해보면 숫자 크기비교를 하기 때문에 정상적으로 100이 50보다 먼저 오는 것을 확인했다. 
    - 해결책 구상: 
        1. 데이터를 숫자로 전달한 다음에 sort를 먼저 처리하고 나서 js로 %를 뒤에 붙여주는 방식을 구현할 수 있다면 해결 할 수 있지 않을까?
        2. sort 알고리즘을 수정해서 %가 있을경우 %를 제외하고 숫자로만 정렬 처리하도록 할 수 있지 않을까?

        - parseInt라는게 있던데 이거 쓰면 편하게 구현할 수 있을지도?

    - 아닌가? 
        - 3.14159. toFixed(2); // 3.14 returns a string.
        - parseFloat(3.14159. toFixed(2)); // 3.14 returns a number.
        - 이런 내용을 봤는데 .toFixed()써서 string취급 되는건가 혹시?

 - 사용자가 버튼을 눌러서 전적갱신을 명령할 수 있는 기능을 구현해야 함. 
    - 이유: 앱이 자동으로 검색시마다 갱신하는것보다 사용자가 필요할때만 갱신하도록 하는 것이 서버의 부담이 적음. 
 - 사용자 입장에서 어떻게 작동해야 하는지 생각해보자.
    1. 우선 마지막으로 갱신된 시간을 화면에 표시해서 사용자가 갱신을 할지 말지 판단할 수 있어야 한다. 
        - 그러려면 db의 user개체에 마지막으로 갱신된 시간을 저장해놓아야 함
    2. 갱신 버튼을 누르면 갱신 처리가 되어야 한다. 
        - 우선 갱신 가능 여부를 판단해야 함. 즉. 마지막으로 갱신된 시간 이후에 치뤄진 경기(match)가 있는지를 보고나서, 있다면 갱신하고 그렇지 않다면 갱신하지 않아야 겠지. 
            - 직접 api요청을 해서 확인해본 결과 beginTime에 해당 유저가 플레이한 마지막 매치의 timestamp이후의 time을 입력하여 요청하면 not found error가 나온다. 
                - RESPONSE BODY
                    {
                        "status": {
                            "status_code": 404,
                            "message": "Not found"
                        }
                    }
                - 이런 식으로. 
            - beginTime에 마지막 갱신시간 값을 넣어서 api에 matchlist요청을 하여 totalGames가 0
        - 마지막 갱신 이후의 전적(matchdata)만 불러와서 추가하고 통계값 처리(processdata)를 해주면 될듯?
        - method POST, view없는 api를 이용하여 구현할 수 있을듯. 
    3. 처음으로 검색된 소환사는 자동으로 갱신을 해주도록 하자. 
    4. 마지막으로 갱신한지 일정시간이상 지나지 않았을 경우 갱신할 수 없도록 해야한다. 1분정도면 적절하지 않을까? op.gg는 2분이네
        - 그리고 이게 ajax인건가 갱신 버튼을 누르면 최근전적 부분만 바뀌고 웹사이트 전체가 새로고침 되지는 않음. 
        - fow의 경우에는 전체 페이지가 새로고침 됨. 난 일단 js locate.reload()로 전체 새로고침하는 방식을 쓰려고 함. 


 - 계정은 있지만 기록된 전적이 없는 소환사의 경우 예외처리를 해주어야 할듯. 아마 status object를 return할테니 그걸로 조건 판단하면 될듯. 

 - 기능 구현을 머릿속으로만 생각하는게 아니고 적거나 type해서 정리하고 진행하니까 훨씬 이해도 잘되고 효율이 괜찮은거 같다. 실수하거나 무언가 빼먹을 일도 줄고. 
 ### 26th Sep. 2021, SUN
 - dataset를 활용해서 서버에서 js로 변수 전달이 가능하다?
    - ㅇㅇ. updatebutton event listener만들때 username이 필요해서 이때 활용함. 
    - lastUpdateTime.js도 수정하자. 괜히 getElementById로 뻘짓했네. 
 - 이게 전적 분석이 시간이 굉장히 오래걸리네. 열개만 하는데도. 천경기 이상 분석하려면 얼마나 걸리는거야 .. 
    - api요청/응답 속도가 가장 큰 원인인듯? 왜냐면 summoner처음 검색 시에 matchlist length나 numOfGamesPlayed가 콘솔에 찍히는 속도가 굉장히 느린걸 봤음. 
    - op.gg같은 서비스는 어떻게 그렇게 빠른거지? production api key는 혹시 더 빠른가??
 ### 27th Sep. 2021, MON
 - db의 user가 matchlist array를 반드시 가져야 하는지 모르겠음. 
 - 그냥 local matchlist array를 바로 processData할때 쓰면 되는거 아닌가? 
    - winrate, championrecords등을 처리하고 나면 matchlist를 가지고 있을 필요는 없는거 같은데??
    - git 분기해서 진행해볼까. 
 - 어떤게 더 나은 방법인지 모르겠다. 

 - 마스터, 그마, 챌린저는 티어 이름 뒤에 숫자 표시되지 않도록 해야함.
 - 업데이트 버튼 클릭시에 summonerinfo, rankinfo등은 항상 업데이트 할 수 있도록 해야함. 
    - 다만 2분제한은 두고
 - 하지만 마지막 업데이트 이후 치뤄진 경기가 없다면 경기/championrecords스탯관련 데이터는 업데이트 될 수 없도록 해야함. (processdata말임.)
 - 데모버전/테스트 위해서 matchlist도 그냥 10~100개 정도만 찾도록 일단 해서 속도 빠르게 해볼 수는 있을듯. 
 ### 28th Sep. 2021, TUE
 - match-v4가 deprecated되어서 9월16일 이후 match data는 검색이 안되는듯.
 - match-v5에서만 되는 것을 확인했음. 
    - match-v5에서 2년간의 데이터가 검색이 된다면 아예 match-v5로 코드를 전부 바꿔야 할거같고.
    - 그렇지 않다면 9월16일 기준으로 이전 데이터는 v4에서. 이후 데이터는v5에서 각각 불러오는 방식을 취해야 할듯. 아이고. 
 ### 7th Oct. 2021, THU
 - 코드 convert?작업을 시작했음. 생각보다는 금방할듯. 
 ### 8th Oct. 2021, FRI
 - 신챔프(벡스)에 대한 데이터가 내 앱에 없어서 테스트 중에 에러가 발생하였다(최근 전적에 벡스와 함께 플레이한 적이 있는 플레이어의 전적검색을 테스트 했음)
 - 이런 신챔프 추가에 대한 업데이트는 어떻게 자동화할 수 있을까? 
 ### 9th Oct. 2021. SAT
 - 피들스틱이 ddragon에 id: "Fiddlesticks"라고 표기되어 있는데 match api에서는 "FiddleSticks"로(s가 대문자)되어 있기 때문에 에러가 발생했다. 왜이런지는 모르겠다. 현재까지는 다른 챔피언이 이런 경우는 없다. 따라서 내 champion_processed.js의 Fiddlesticks를 FiddleSticks로 바꾸어 주었다. 디스코드에 fiddlesticks로 검색하면 해당 이슈가 다뤄졌던 것을 확인할 수 있다. 
 ### 10th Oct. 2021. SUN
 - api match called, matchId:  KR_5489084861
 - api call error, status:  { message: 'Rate limit exceeded', status_code: 429 }
 - 이런식으로 rate limit exceeded라는 에러가 뜰때가 있다. 계산상으로 2초 대기 후 요청하기 때문에 그럴리가 없는데 랜덤으로 종종 발생하는거 같다. 
    - 내 추측으로는 그냥 api 전체적으로 많은 요청이 발생했을때(나 뿐만 아니라 다른사람들 포함해서) riot api측에서 이런 제어를 하는게 아닌가 싶다. 
    - 만약 그렇다면 이렇게 누락된 녀석들의 matchId만 모아놨다가 나중에 다시 요청해서 추가하는 기능을 짤 수 있을듯? 
    - 뿐만 아니라 다른 error와 status_code가 뭐가 있는지 알아봐야겟다. 아니면 status_code도 함께 저장하도록 코드를 만들어서 직접 확인해보는게 좋을수도 있겠고. 

 - 괴물쥐쥐의 주요 서비스는 소환사 개인의 전체 챔피언별 상대 전적인데 이
    - (아니면 유명 플레이어의 전적이 궁금한 일반 유저들이 검색할 수도 있겠다. 내가 그런 경우가 많으니) 
    - 아무튼 뭔가 지속적으로 사람들이 방문할 만한 서비스가 필요하다고 느꼈다. 
    - 그래서 생각한게 최근 몇경기(10, 50, 100, ...)동안 만난 챔피언들을 정리해서 서비스해 보는건 어떨까 하는 아이디어. 
        - 메타 챔피언, 혹은 그냥 내 티어, 내가 자주 만나는 챔피언을 알 수 있도록 말이다. 
        - (내가 플레이한 챔피언과 상관없이 말이다)
        - 어쩌면 그냥 기존 데이터 가지고 합치는 방식으로 할수도 있을듯?

 - 어떤 동작 중에 서버에 에러나면 에러 화면을 보여주도록 해야함 무한로딩 시키지 말고.

 ### 12th Oct. 2021, TUE
 - 할거/고민 정리
 - [x] 처음 summoner화면이 로딩 되면 encountered champions table이 디폴트로 most played against순으로 정렬되게 하고 싶음. 
 - [x] 50% 100% 정렬 버그 수정
 - [x] 지연시간 주석처리 해놓고 loop max지정하기 getmatchlist는 한번, updatechampionrecords는 5번정도? 
 - [ ] 마지막 갱신시간 표시할때 서버에서 epoch time을 받아온 후 브라우저 js에서 다시 일반 시간형식으로 바꾸는 방법을 쓰고 있는데 이게 시간이 좀 걸리다 보니 epoch time이 그대로 노출됨. 이것도 수정하면 좋을듯.
 - [x] 이렇게 했을때 한사람당 대충 얼마나 걸리는지 확인해보기
    - 로딩할때 로딩화면 보여주는 등의 해결책을 생각해봐야할지 판단
    - 소환사 데이터 처리중에 또다시 검색되었을 경우 현재 에러가 발생하는데 이거 어떻게 처리할지도 판단
    - [ ] 이것도 production key받고 나서 다시 판단할 수 있을듯. 
 - [x] 접기 펼치기 화살표 만들어서 좀더 직관적인 디자인 만들기. 아마 fontawesome에서 가져올 수 있지 않을까 대충 삼각형 모양으로
 - [ ] 서버 에러 발생했을때 페이지 처리
 - [ ] encounteredChampionsTable에 총 만난 횟수(played against + played with)추가할지 고민
 - [ ] 최근 ~판동안 만난 챔피언들 기능추가 고민
 - [ ] 시즌별로 볼 수 있도록 페이지 만들어야 함. 
    - 당장 11월에 시즌 11끝남. 근데 그렇다고 시즌 12가 당장 시작하는건 아닌데 이 기간의 기록은 어떻게 분류해야 하는거지
        - 걍 여전히 시즌 11로 분류해야 맞지 않을까 싶은디
    - 아마 전시즌 통합으로 볼 수 있게도 하면 좋겠지?
 - [x] 티어 엠블럼 op.gg에서 가져오고 있는데 혹시 문제될 수 있으니 소스 바꿔야 할듯. 
    - 일단 티어 이미지를 다운 받아서 express static이용해서 스태틱 폴더로 만들어서 사용하는 중. 아마 storage에 저장하면 링크로 가져올 수 있을듯.
 - [x] 벡스 이미지 깨짐. 그리고 소환사 프로필 아이콘도 이미지 깨지는것들 있더라. 
    - 이건 패치 버전 문제임.(ddragon링크 11.18.1 => 11.20.1) 이것도 자동화 할 수 있는 방법이 있을거 같다.
 - [x] 피들스틱 이미지 깨짐. 이건 패치버전과 무관하게 champion name이슈. 위에 자세하게 적어둠.
    - pug에서 피들스틱인 경우 예외처리 함.
 - [x] 배포(deploy)
    - 배포하기 전에 기능에 대해 좀더 안내 가이드? 같은것을 사이트 내에 표시해야 하는지 생각해 봐야겠음.
    - [ ] deploy했는데 너무너무 느림. updatechampionrecords할때 matchdata를 count해서 db저장은 한번만 하도록 하면 속도가 많이 개선될 수 있을까? (db update과정을 loop에서 빼고 마지막에 한번만 하도록)
 - [ ] 라이엇에 production key요청
    - [ ] 프로덕션 키 받고 나면 처리시간 얼마나 걸리는지 확인하고 만약 여전히 오래걸린다면 로딩 방식/화면 고민좀 해봐야 겠음. 예를들어 일단 소환사프로필만 먼저 띄워주고 chapmionrecords는 로딩완료되면 그때 띄워준다던가. 
 - [ ] winrate을 서버/db에서 계산/저장하지 않고 프론트엔드 js에서 할지 고민.
    - 유의미한 시간차이 / 서버 계산처리량 차이 / db저장용량 차이 가 있을까??
 - [x] 함께 플레이한 적이 없을때는 승률/wins X표시 시켜야됨. 
    - 이거 때문에 sort함수도 수정했음. 정확히는 getCellValue 함수를 수정함. 왜냐하면 x표시된 녀석들은 해당사항이 없는 녀석들(N/A)이기 때문에 sort order가 ascending이던 descending이던 항상 맨 아래에 오도록 해야되는데 그러기 위해서 descending인 경우에는 -1을 주고 ascending인 경우에는 infinity를 줘서 항상 맨 아래로 가도록 함. 
    - 이 과정에 parentNode, children등등 새로 알게된 html dom property등을 활용할 수 있어서 좋았음. 
 - [ ] 이제 안쓰는 파일들 정리. controllers
 - [ ] champion_processed.js 파일 위치?
 - [ ] 언랭일때 소환사 프로필 처리 해야함. e.g. 지이0l잉
 - [ ] 서버, 언어 바꾸는 기능. (언어는 일단은 영어/한국어만 할 수 있겠지. 혹시 문자 달라지면 인코딩도 맞춰서 바꿔야 하려나?)
 - [ ] 업데이트 제한기능 추가해야 함. (2분으로 하자)
 - [ ] 소환사 검색 안될때 그냥 홈으로 돌리지 말고 검색 안된다고 설명 해줘야 할듯. 
 - [ ] 티어 엠블럼 외부 링크 통해 가져오는게 바람직할듯 한데. 그렇다고 외부 저장소를 이용하는게 맞나? 
 ### 14th Oct. 2021, THU
 - winrate를 서버에서 계산 안해도 되네? 프론트엔드에서 처리하면 되니까. 
 - 기록 17 부분 deploy를 하기 위해 dev용으로 project를 따로 복사해놨다. 
 - heroku cli 설치된 상황에서  heroku logs --app=monstergg 이런식으로 터미널에서 명령어를 통해 내 앱에 대해 로그를 확인할 수 있다는 것을 알게됨. (heroku git 안쓰고 github connect하더라도 사용 가능)
    - 그리고 뒤에 --tail 붙여주면 실시간으로 서버로그 확인 가능.

 - 안녕하세요.
    저도 전적검색 사이트를 만들고 있는데 블로그 게시글이 많은 도움이 되었습니다 감사합니다.

    monstergg.herokuapp.com
    이게 제 사이트인데 사이트가 너무 느려서 몇가지 질문드리고 싶은게 있습니다.
    현재는 rate limit도 있고 해서 최대 5경기 데이터만 처리하도록 제한을 걸어 두었는데요, 웹사이트를 작동시켜보면 5경기만을 처리하는 시간도 상당히 오래걸립니다.

    우선 제 사이트 기능은 소환사가 플레이한 챔피언들의 아군과 상대 챔피언 별 전적을 표로 보여주는 것인데 (예를들어 소환사의 오리아나는 사일러스를 몇번이나 적으로 만났으며 얼마의 승률을 가지고 있는지를 표에 보여주는 식입니다. 따라서 소환사당 수십~수백판의 경기를 처리해야 하는 상황)
    이를 구현하기 위해서 소환사의 matchId들을 가지고 플레이한 모든 경기를 한판씩 fetch하고 그때마다 필요한 데이터를 뽑아서 소환사 db instance에 저장하는 식으로 코드를 짰습니다.

    그리고 저는 db는 mongodb cloud를 쓰고 deploy는 heroku통해서 했는데(둘다 무료 플랜) 개발자님은 db와 deploy를 어떻게 하셨는지, 또 이것들이 웹사이트 작동 속도에 얼마나 영향을 주는지 궁금합니다.

    deploy하고나서만큼은 아니지만 deploy하기 전에 개인 컴퓨터에서 작동시켜 봤을때도 속도가 lolog.me나 다른 통계사이트처럼 빠르지가 않았던걸로 봐서는 코드 자체를 개선해야 하는게 아닌가 싶은데, 어쨌든 조언해주시면 정말 감사하겠습니다.

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

# concepts learned (새로써본 것들, 알게된 것들)
 - JS map? (hash map)
 - mongoose Map Type
 - mongoose subdocument
 - JS .find(x => x.key == value)  method. 
    - e.g. if(matchData.teams.find(team => team.teamId == 100).win == "Win")

 - 15th Sept
    - Object.fromEntries(a_Map) 로 Map자료형을 Object로 convert할 수 있다. 
    - mixin inside a mixin 가능하다. 
    - Spread syntax (...)
        - an_array = \[...Map\]

 - js 함수에는 object와 array등을 통째로 parameter로서 pass over할 수 있다. 
 - js에서 variable을 declare하고 값을 assign하지 않는다면 undefined를 가진다.
 - js object가 const여도 property값은 바꿀 수 있다. 또한 property를 추가하고 제거하는것도 가능하다. 포인터같은 주소할당의 개념인건가? 
# concepts that i want to learn more 
1. JS basic syntax and ES6 syntax
    - Object, Map
    - js push vs. concat performance
    - js undefined vs. null
    - js if false conditions
        - is null, 0, undefined always false? what elses are falses?
    - tableSort함수 syntax 이해하기. 
    - prototype-oriented language? 개념 (https://stackoverflow.com/questions/256754/how-to-pass-arguments-to-addeventlistener-listener-function)
    - lexical this
2. promise then / async await
3. mongoose / mongodb 기본기
    - fields? documents? types? schema?
    - when to use Subdocument
    - how to update subdocument values of a data object
    - and when to use Schema.Types.ObjectId ( how are the two different? )
4. html dom properties (selectors)
    - parentNode
    - children vs. childNodes
    - querySelector vs. getElementsByTagName