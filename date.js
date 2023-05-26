module.exports = function getDate() {
    var today = new Date();

    var option = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    return today.toLocaleDateString("en-US", option);

}