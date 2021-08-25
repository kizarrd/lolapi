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

# logs - 경험하며 알게된 것들
### 3rd Aug 2021. TUE
 - the maximum matchlist range allowed for one query is 100
    - e.g. if you played tf for 431 games, then you need to execute 5 queries in total to cover all 431 games. (0-100, 100-200, 200-300, 300-400, 400-432)
    - lol api matchlist index range seems it doesn't count the endIndex.
        - which means that if startIndex(beginIndex): 0 and endIndex: 100, then it actually shows the list from 0 to 99, excluding the 100. 
        - so if you want a list of 100 matches from 0 to 99, then you need to input 0 for startIndex(beginIndex) and 100 for the endIndex. 


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