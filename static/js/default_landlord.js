// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    self.change_is_add_property = function() {
        self.vue.is_add_property = !self.vue.is_add_property;
        
        if(self.vue.is_add_property && self.vue.page=="add1"){
            $("div#goog").show();
        } else {
            $("div#goog").hide();
        }
    };

    self.goto = function(pg) {
        self.vue.page = pg;

        switch(pg){
            case "add2":
                $("div#goog").hide();
                break;
        }
    };

    self.get_groupnames = function() {
        $.getJSON(get_groupnames_url,
        function (data) {
            self.vue.group_names = data.groupNames;
            if(self.vue.form_group==null){
                self.vue.form_group = data.groupNames[0];
            }
        });
    };
    

    self.set_form_group = function(namet,idt) {
        self.vue.form_group.name = namet;
        self.vue.form_group.id = idt;

        self.get_groupnames();
    };

    self.add_group = function(){
        $.post(add_group_url,
            {
                newName: self.vue.form_new_group,
            },
            function(data){
                self.get_groupnames();
                self.vue.form_new_group = null;
                // alert(self.vue.group_names.length);
            }   
        );
    };

    self.hide = function(){
        self.vue.is_add_property = false;
    };

    self.cancel_form = function() {
        self.vue.page = "add1";
        self.vue.form_address = null;
        self.vue.form_prefname = null;
        self.vue.is_add_property = false;
        self.vue.form_tenant_email = null;
        self.vue.form_amount = null;
        $("div#goog").hide();
    };


    self.submit_add_property = function() {

        alert(
            self.vue.form_address + '\n' +
            self.vue.form_prefname + '\n' +
            self.vue.form_group.name + '\n' +
            self.vue.form_tenant_email + '\n' +
            self.vue.form_amount
            
            
        );

        $.post(add_listing_url,
        {
            form_address: self.vue.form_address,
            form_prefname: self.vue.form_prefname,
            form_group: self.vue.form_group.id,
            form_tenant_email: self.vue.form_tenant_email,
            form_amount: self.vue.form_amount,

        },
        function(data){
            self.cancel_form();
        });

    };

    self.get_listings = function(){
        $.getJSON(get_listings_url,
            function(data){
                self.vue.listings = data.listings;
                // alert(self.vue.listings.length);
                self.get_listings();
            }
        
        );

    };
    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_add_property: false,
            form_address: null,
            page: "add1",
            form_prefname: null,
            form_group: null,
            group_names: [],
            form_new_group: null,
            form_amount: null,
            form_tenant_email: null,
            listings: [],

        },
        methods: {

            change_is_add_property: self.change_is_add_property,
            goto: self.goto,
            set_form_group: self.set_form_group,
            add_group: self.add_group,
            hide: self.hide,
            cancel_form: self.cancel_form,
            submit_add_property: self.submit_add_property,
        }

    });

    self.get_listings();
    self.get_groupnames();
    return self;
};


var APP = null;



// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
$(document).ready(function () {
    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    });

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar, #content').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });
});




// This is for Google Maps integration
$("div#goog").hide();
function initialize() {
    var input = document.getElementById('searchTextField');
    new google.maps.places.Autocomplete(input);
  }
  
  google.maps.event.addDomListener(window, 'load', initialize);