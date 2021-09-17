export const home = (req, res) => {

    const { username2 } = req.query;
    if(username2){
        return res.redirect(`/summoners/${username2}`);
    }
    return res.render("home");
};