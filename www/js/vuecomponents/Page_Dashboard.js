function Page_Dashboard() {


    Vue.component('dashboard-stackcontainer', {
        props:['container'],
template:'{{container.Id}}',


    })
    Vue.component('dashboard-stack', {
        props:['stack'],
template:'{{stack.label}}\
 <span v-for="c in stack.containers">\
        <dashboard-stackcontainer :container=c></dashboard-stackcontainer>\
         </span>',


    })



    Component_Dashboard = Vue.extend({

        template: '<div style="margin-top:30px" v-for="node in nodes">\
        <div style="margin-top:30px" v-for="stk in node.stacks">\
        <dashboard-stack :stack=stk>{{id}}</dashboard-stack>\
         </div>\
        </div>',
        data: function(){
            return {nodes:hostNodes}
        },
        attached: function () {
            console.log("HEREEE")
            console.log(this.nodes[0].stacks[0].label)

        }
    })


}