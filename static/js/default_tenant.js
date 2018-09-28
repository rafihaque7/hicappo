// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};
    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };


    self.goto = function(pg){
        self.vue.page = pg;
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

    self.temp_to_permanent = function() {
        $.post(temp_to_permanent_url,
            {
                theid: self.vue.temp_listing.id,
            },function(data){
                $("#modal_found_listing").modal('hide');
                self.get_tenant_listings();
            }
        );
    };

    self.find_temp_listings = function() {
        $.getJSON(find_temp_listings_url,
        function(data){
            var i;
            for (i = 0; i < data.temp_listings.length; i++){
                self.vue.temp_listing = data.temp_listings[i];
                $("#modal_found_listing").modal();
            }
            
        });
    };

    self.get_tenant_listings = function() {
        $.getJSON(tenant_listings_url,
            function(data){
                self.vue.tenant_listings = data.tenant_listings;
                enumerate(self.vue.tenant_listings);
            }
        );
    };

    self.find_with_email = function() {
        $("#modalemail").modal();

        $.post(find_temp_listings_url,
            {
                theEmail: self.vue.form_email,
            }, function(data){

                if (data.temp_listings==0){
                    $("div#noresult").show();
                    setTimeout(function(){ 
                        $("div#noresult").hide();
                    }, 1000);
                }

                var i;
                for (i = 0; i < data.temp_listings.length; i++){
                    self.vue.temp_listing = data.temp_listings[i];
                    $("#modal_found_listing").modal();
                }
                
            }
        );
    };
    self.click_email = function() {
        $("#modalemail").modal()
    };


    self.make_payment_unit = function(idx) {
        
        self.vue.payment_checkout_unit = self.vue.tenant_listings[idx];

        self.stripe_instance = StripeCheckout.configure({
            key: 'pk_test_EwkHPkI2yzSM2ejDJlJSMinW',    //put your own publishable key here
            image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
            locale: 'auto',
            token: function(token, args) {
                console.log('got a token. sending data to localhost.');
                self.stripe_token = token;
                self.customer_info = args;
                self.send_data_to_server();
            }
        })

        self.vue.page = "payment";
        
    };


    self.send_data_to_server = function () {
        // Calls the server.
        // alert("the id that gets sent is " + self.vue.payment_checkout_unit.id);
        $.post(purchase_url,
            {
                customer_info: JSON.stringify(self.customer_info),
                transaction_token: JSON.stringify(self.stripe_token),
                amount: self.vue.payment_checkout_unit.amount,
                landlord_id: self.vue.payment_checkout_unit.landlord_id,
                tenant_id: self.vue.payment_checkout_unit.tenant_id,
                listing_id: self.vue.payment_checkout_unit.id,
            },
            function () {
                // The order was successful.
                self.vue.page = "success";
                self.get_tenant_listings();
            }
        );
    };

    self.pay = function () {
        self.stripe_instance.open({
            name: "Hicappo",
            description: "Pay Rent",
            billingAddress: true,
            shippingAddress: true,
            amount: Math.round(self.vue.cart_total * 100),
        });
    };

    self.get_payment_history = function() {
        self.vue.page = 'payment_history';

        $.post(payment_history_content_url,
            {
                typeUser: "tenant",

            },
            function(data){
                self.vue.payment_history = data.payment_history;
            }
        );

    };

    // self.get_rest = function() {
    //     $.getJSON('http://localhost:3003/users',
    //         function(data) {
    //             alert(data[0].first_name)
    //         }
    //     )
    // };  

    

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            page: "home",
            temp_listing: [],
            tenant_listings: [],
            form_email: null,
            payment_checkout_unit: null,
            payment_history: [],
        },
        methods: {
            change_default: self.change_default,
            goto: self.goto,
            temp_to_permanent: self.temp_to_permanent,
            find_with_email: self.find_with_email,
            click_email: self.click_email,
            make_payment_unit: self.make_payment_unit,
            pay: self.pay,
            get_payment_history: self.get_payment_history,
            get_rest: self.get_rest,
        
        }

    });

    $("div#loading").hide();
    $("div#noresult").hide();
    self.find_temp_listings();
    self.get_tenant_listings();
    self.get_rest();
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
