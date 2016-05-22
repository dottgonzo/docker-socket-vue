

var hostNodes = [];


function dockerInspects(data, label) {
    _.map(hostNodes, function (hostnode) {
        if (hostnode.label == label) {
            hostnode.inspect = data;
        }

    })
    console.log(label, data);

}







function Socket(token, connection, label) {
    console.log(token)
    var socket;
    socket = io.connect(connection, {
        'query': 'token=' + token
    });

    socket.on('connect', function () {
        console.log("subscribed")
        socket.emit('subscribe', "inspects");

    });


    socket.on('inspects', function (data) {
        dockerInspects(data, label)

    });
    socket.on("error", function (error) {
        if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
            // redirect user to login page perhaps?
            console.log("User's token has expired",error);
        }
    });
}



function login() {
    console.log("login")
    return new Promise(function (resolve, reject) {

        hostNodes.push({ label: "zero", token: false, io_url: 'http://studio.caruso.online:6767', online: false })

        localStorage.setItem("nodes", JSON.stringify(hostNodes))
        resolve(true)
    })


}

function startApp() {
    console.log("start app now")
    _.map(hostNodes, function (hostnode) {
        console.log(hostnode.token, hostnode.io_url, hostnode.label);
        Socket(hostnode.token, hostnode.io_url, hostnode.label)

    });



    // Vue.use(VueAsyncData)

    Vue.use(VueI18n, {
        lang: locale,
        locales: locales
    })


    Page_Dashboard();


    var App = Vue.extend({})
    router = new VueRouter()




    router.map({

        '/': {
            component: Component_Dashboard
        }
    })

    router.start(App, '#app');


}
function getData(nodeswithtoken) {
    var nodesinspects = [];
    return new Promise(function (resolve, reject) {
        async.each(nodeswithtoken, function (iterator, cb) {


            $.ajax({
                type: 'GET',
                url: iterator.io_url + "/data",
                dataType: 'json',
                success: function (data) {

                    iterator.inspect = data;



                    nodesinspects.push(iterator)

                    cb();
                },
                error: function (err) {
                    console.log("error", err);
                    cb();
                }
            });


        }, function (err) {
            if (err) {

                reject(err);
            } else {

                resolve(nodesinspects);
            }
        })
    })


}
function getTokens(nodes) {

    var nodeswithtoken = [];
    return new Promise(function (resolve, reject) {

        async.each(nodes, function (iterator, cb) {
            $.ajax({
                'type': 'POST',
                'url': iterator.io_url + "/login",
                'contentType': 'application/json',
                'data': JSON.stringify({}),
                'dataType': 'json',
                'success': function (a) {
                    iterator.token = a.token;
                    iterator.online = true;
                    nodeswithtoken.push(iterator)

                    cb();


                },
                "error": function (err) {
                    iterator.online = false;
                    nodeswithtoken.push(iterator)

                    cb();

                }
            });
        
            // iterator.io_url+"/login";

        }, function (err) {
            if (err) {

                reject(err);
            } else {
                resolve(nodeswithtoken);
            }
        })


    })


}

function checkbefore() {
    console.log("start")
    if (localStorage.getItem("nodes")) {
        console.log(localStorage.getItem("nodes"))
        console.log("try to authorize")
        getTokens(JSON.parse(localStorage.getItem("nodes"))).then(function (nodeswithtoken) {
            console.log("try to get data")
            getData(nodeswithtoken).then(function (nodeinspecteds) {
                hostNodes = nodeinspecteds;
                console.log("try to start app")
                startApp()
            }).catch(function (err) {
                console.log(err)
            })

        }).catch(function (err) {
            console.log(err)
        })


    } else {
        console.log("try to login")
        login().then(function () {
            checkbefore()
        }).catch(function (err) {
            console.log(err)
        })
    }
}
checkbefore();