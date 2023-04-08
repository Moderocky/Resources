export const date = {
    tomorrow: function () {
        return this.plus(24);
    },
    plus: function (hours = 0, minutes = 0, seconds = 0) {
        let date = new Date();
        date.setHours(date.getHours() + hours);
        date.setHours(date.getMinutes() + minutes);
        date.setHours(date.getSeconds() + seconds);
        return date;
    }
}
