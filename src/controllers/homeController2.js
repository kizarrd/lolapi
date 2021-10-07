export const home = (req, res) => {

    const { username_search } = req.query;
    if(username_search){
        return res.redirect(`/summoners/${username_search}`);
    }
    return res.render("home");
};