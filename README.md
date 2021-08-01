# lolapi
lol stat website using lol api

default main


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

[] MVC settings
[] fetch lolapi data and show it on view
[] build routers
[] design in detail


# Questions & Problems
1. can I res.render an html file? (instead of using pug as view engine)
2. when using fetch, summoner name is included in url. the problem is, if the name is in korean, error occurs. 