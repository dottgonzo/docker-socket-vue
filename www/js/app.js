

var localhost = {

}

localStorage.setItem("nodes", JSON.stringify(localhost))

var hostNodes = [];


function dockerInspects(data, label) {
    _.map(hostNodes, function (hostnode) {
        if (hostnode.label == label) {
            hostnode.inspect = data;
        }

    })
    console.log(label, data);

}







function Socket(jwt, connection, label) {
    var socket;
    socket = io.connect(connection, {
        'query': 'token=' + jwt
    });

    socket.on('connect', function () {

        socket.emit('subscribe', "inspects");

    });


    socket.on('inspects', function (data) {
        dockerInspects(data, label)

    });

}



function login() {
    return new Promise(function (resolve, reject) {

        hostNodes.push({ label: "zero", token: false, io_url: 'https://studio.caruso.online:6767', online: false })

    })


}

function startApp() {
    _.map(hostNodes, function (hostnode) {

        Socket(hostnode.io_url, hostnode.label)

    });



    // Vue.use(VueAsyncData)

    Vue.use(VueI18n, {
        lang: locale,
        locales: locales
    })


    Page_Home();


    var App = Vue.extend({})




    router.map({

        '/': {
            component: Home
        }
    })

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
                    if (iterator.token) delete iterator.token;

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

        async.each(nodes, function (iterator) {
            $.ajax({
                'type': 'POST',
                'url': iterator.io_url + "/login",
                'contentType': 'application/json',
                'data': JSON.stringify({}),
                'dataType': 'json',
                'success': function (a) {
                    iterator.token = "XXXX";
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
    if (localStorage.getItem("nodes")) {
        getTokens(JSON.parse(localStorage.getItem("nodes"))).then(function (nodeswithtoken) {
            getData(nodeswithtoken).then(function (nodeinspecteds) {
                hostNodes = nodeinspecteds;
                startApp()
            }).catch(function (err) {
                console.log(err)
            })

        }).catch(function (err) {
            console.log(err)
        })


    } else {
        login().then(function () {
            checkbefore()
        }).catch(function (err) {
            console.log(err)
        })
    }
}
checkbefore();