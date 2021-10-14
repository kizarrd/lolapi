export const home = (req, res) => {

    const { username_search } = req.query;
    if(username_search){
        return res.redirect(`/summoners/${username_search}`);
    }
    return res.render("home");
};

export const riotVerification = (req, res) => {
    res.send("10cfc04f-9e97-496c-9ed8-d6b97cf93553");
}