var ip = "10.96.18.48";

var serverManager = {
    httpPostJSON: function (url, json) {

        return new Promise(function (resolve, reject) {

            var xhr = new XMLHttpRequest(),
                data = JSON.stringify(json);

            xhr.open('POST', url, true);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onload = function () {
                if (this.status == 200) {
                    resolve(this.response);
                } else {
                    var error = new Error(this.statusText);
                    error.code = this.status;
                    reject(error);
                }
            };

            xhr.onerror = function () {
                reject(new Error("Network Error"));
            };

            xhr.send(data);
        });
    },

    httpGet: function(url) {

    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function() {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                var error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };

        xhr.onerror = function() {
            reject(new Error("Network Error"));
        };

        xhr.send();
    });

},
    sendPlayerConfig: function (json, callBack) {
        this.httpPostJSON("http://" + ip + ":8089/", json)
            .then(
                response => callBack(response),
                error => alert(`Rejected: ${error}`)
            );
    },

    getAllPlayersConfig: function (callBack) {
        this.httpGet("http://" + ip + ":8089?needFullConfig=true")
            .then(
                response => callBack(JSON.parse(response)),
                error => alert(`Rejected: ${error}`)
            );
    }
};