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

            case "home":
                self.vue.last_group_name = "all";
                break;
            case "add1":
                $("div#goog").show();
                break;
            case "add2":
                self.vue.form_address = $("#searchTextField").val();
                $("div#goog").hide();
                break;
        }
    };


    self.get_payment_history = function() {
        self.vue.page = 'payment_history';

        $.post(payment_history_content_url,
            {
                typeUser: "landlord",

            },
            function(data){
                self.vue.payment_history = data.payment_history;
            }
        );

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
        self.vue.page = "home";
        self.vue.form_address = null;
        self.vue.form_prefname = null;
        self.vue.is_add_property = false;
        self.vue.form_tenant_email = null;
        self.vue.form_amount = null;
        self.vue.last_group_name = "all";
        $("div#goog").hide();
    };


    self.submit_add_property = function() {

        // alert(
        //     self.vue.form_address + '\n' +
        //     self.vue.form_prefname + '\n' +
        //     self.vue.form_group.name + '\n' +
        //     self.vue.form_tenant_email + '\n' +
        //     self.vue.form_amount
            
            
        // );


        $.post(add_listing_url,
        {
            form_address: self.vue.form_address,
            form_prefname: self.vue.form_prefname,
            form_group: self.vue.form_group.id,
            form_tenant_email: self.vue.form_tenant_email,
            form_amount: self.vue.form_amount,
            form_image_url: self.vue.form_image_url,

        },
        function(data){
 
            self.cancel_form();
            
            self.get_listings();
        
            
        });

    };

    self.get_listings = function(){
        $.getJSON(get_listings_url,
            function(data){
                self.vue.last_group_name = "all";
                self.vue.listings = data.listings;
                // alert(self.vue.listings.length);
                // self.get_listings();
            }
        
        );

    };


    self.upload_file = function (event) {
        // Reads the file.
        $("div#loading").show()
        var input = event.target;
        var file = input.files[0];
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };

    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.vue.form_image_url = get_url;
        $("div#loading").hide()


        // alert(self.vue.form_image_url);
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        
        
        
    };


    self.change_default = function(what){
        $.post(change_default_url,
            {
                what: what,
            },
            function(){

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
            page: "home",
            form_prefname: null,
            form_group: null,
            group_names: [],
            form_new_group: null,
            form_amount: null,
            form_tenant_email: null,
            listings: [],
            form_image_url: null,
            payment_history: [],
        },
        methods: {

            change_is_add_property: self.change_is_add_property,
            goto: self.goto,
            set_form_group: self.set_form_group,
            add_group: self.add_group,
            hide: self.hide,
            cancel_form: self.cancel_form,
            submit_add_property: self.submit_add_property,
            upload_file: self.upload_file,
            last_group_name: "all",
            change_default: self.change_default,
            get_payment_history: self.get_payment_history,
        }

    });

    self.get_listings();
    self.get_groupnames();
    $("div#loading").hide()
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
$("div#hideit").hide();
function initialize() {
    var input = document.getElementById('searchTextField');
    new google.maps.places.Autocomplete(input);
  }
  
  google.maps.event.addDomListener(window, 'load', initialize);