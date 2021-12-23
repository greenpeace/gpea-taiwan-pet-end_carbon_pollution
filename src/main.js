const dayjs = require("dayjs")
const { $, AOS } = window
const Mailcheck = require('mailcheck');
const currencyFormatter = require('currency-formatter');

// let footer_main_page_url = `https://www.greenpeace.org/taiwan/?ref=2021-plastic_policy_petition`
// let footer_donate_url = `https://supporter.ea.greenpeace.org/tw/s/donate?campaign=plastics&ref=2021-plastic_policy_petition-footer`
// let footer_privacy_url = `https://www.greenpeace.org/taiwan/policies/privacy-and-cookies/?ref=2021-plastic_policy_petition`

// window.directTo = function (type) {
//     switch (type){
//         case 'main':
//             window.open(footer_main_page_url, '_blank');
//             break
//         case 'donate':
//             window.open(footer_donate_url, '_blank');
//             break
//         case 'privacy':
//             window.open(footer_privacy_url, '_blank');
//             break
//         default: 
//         window.open(footer_privacy_url, '_blank');
//     }
// }

$(document).ready(function () {
    console.log("ready!");
    initForm();
    checkEmail();
    init();
    initProgressBar();
    
    // lightbox
    //$('.lightbox').fadeIn(100);
    $('.lightbox').hide();

    $('.lightbox-close, .bg-trasitonblack').on("click",function(e){
      e.preventDefault();
      $('.lightbox').fadeOut(100);
    });

    $('.lighbox-btn').on("click",function(e){
      e.preventDefault();
      $('.lightbox').fadeOut(100);
      var hash = $(this).attr("href");
      $('html,body').animate({ scrollTop:$(hash).offset().top}, 800);
    });
});

/**
 * email suggestion / email correction
 */
function checkEmail() {
    let domains = [
        "me.com",
        "outlook.com",
        "netvigator.com",
        "cloud.com",
        "live.hk",
        "msn.com",
        "gmail.com",
        "hotmail.com",
        "ymail.com",
        "yahoo.com",
        "yahoo.com.tw",
        "yahoo.com.hk"
    ];
    let topLevelDomains = ["com", "net", "org"];

    $("#email").on('blur', function () {
        console.log($("#email").val())
        Mailcheck.run({
            email: $("#email").val(),
            domains: domains, // optional
            topLevelDomains: topLevelDomains, // optional
            suggested: (suggestion) => {
                $('.email-suggestion').remove();
                $(`<div class="email-suggestion">您想輸入的是 <strong id="emailSuggestion">${suggestion.full}</strong> 嗎？</div>`).insertAfter("#email");

                $(".email-suggestion").click(function () {
                    $("#email").val($('#emailSuggestion').html());
                    $('.email-suggestion').remove();
                });
            },
            empty: () => {
                // this.emailSuggestion = null
            }
        });
    });
}


var progressNow = parseInt(document.querySelector('[name="numResponses"]').value);

const initProgressBar = () => {

    // console.log("progress bar")
    // const goal = document.querySelector('[name="numSignupTarget"]').value;
    let goal = (Math.floor(progressNow / 5000) + 2) * 5000;
    // console.log($('#mc-form'))
    // console.log(goal)
    // console.log(current)


    // progress bar
    $('.kv__bar').attr('data-now', progressNow)
    $('.kv__bar').attr('data-all', goal)
    $('.kv__num').text(currencyFormatter.format(progressNow, { style: 'currency', precision: 0 }));
    $("#progress_goal").text(currencyFormatter.format(goal, { style: 'currency', precision: 0 }))
    //   var goal = Number($('.kv__bar').attr('data-all'));
    var percent = Math.round(progressNow / goal * 100);
    $('.kv__bar-fill').css('width', percent + '%');

}

const initForm = () => {

    // 送出表單後
    // $('#submitForm').on('click', function (e) {
    //     //e.preventDefault();
    //     $('#signForm').hide();
    //     $('#signDone').fadeIn();
    //     $('html, body').scrollTop($('#signDone').offset().top);
    // });

    // $('#signForm').hide();
    // $('#signDone').fadeIn();

    console.log('init form')
    

    let currYear = new Date().getFullYear()
    $("#birth-year").append(`<option value=""> - </option>`);
    
    for (var i = 0; i < 80; i++) {
        let option = `<option value="${currYear-i}">${currYear-i}</option>`
        $("#birth-year").append(option);
    }

    $.validator.addMethod(
        "taiwan-phone",
        function (value, element) {
            
            const phoneReg6 = new RegExp(/^(0|886|\+886)?(9\d{8})$/).test(value);
            const phoneReg7 = new RegExp(/^(0|886|\+886){1}[3-8]-?\d{6,8}$/).test(value);
            const phoneReg8 = new RegExp(/^(0|886|\+886){1}[2]-?\d{8}$/).test(value);

            if ($('#mobile').val()) {
                return (phoneReg6 || phoneReg7 || phoneReg8)
            }
            console.log('phone testing')
            return true
        },
        "電話格式不正確，請只輸入數字 0912345678 和 02-23612351")

    $.validator.addClassRules({ // connect it to a css class
        "email": {email: true},
        "taiwan-phone" : { "taiwan-phone" : true }
    });

    $('#visible-form').validate({
        errorPlacement: function(error, element) {
            console.log(error)
            element.after( error );
        },
        submitHandler: function(form) {
            
            console.log('mc form submit')
            $('#mc-form [name="Email"]').val($('#email').val())
            $('#mc-form [name="LastName"]').val($('#last-name').val());
            $('#mc-form [name="FirstName"]').val($('#first-name').val());
            $('#mc-form [name="MobilePhone"]').val($('#mobile').val());
            $('#mc-form [name="OptIn"]').val($('#optin').prop('checked'));
            $('#mc-form [name="Birthdate"]').val(dayjs($('#birth-year').val()).format("YYYY-MM-DD"));
            $('#mc-form [name="CampaignData1__c"]').val($('#campaign-data-1').val());
            $('#mc-form [name="CampaignData2__c"]').val($('#campaign-data-2').val());
            // collect values from form
            let formData = new FormData();
            Object.keys($("#mc-form input")).forEach(function (el) {
                let e = $("#mc-form input")[el]
                let v = null;
                if (e.type === "checkbox") {
                    // console.log(e)
                    v = $('#optin').prop('checked');
                } else {
                    v = e.value;
                }
                formData.append(e.name, v);
                console.log('use', e.name, v)
            });

            // need testing
            $(".loading-cover").fadeIn();
            return fetch($("#mc-form").attr("action"), {
                method: "POST",
                body: formData,
            }).then((response) => {
                $(".loading-cover").fadeOut();
                progressNow += 1;
                initProgressBar();
                if (response.ok) {
                    return response.json()
                }
                throw ({
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    type: response.type,
                })
            }).then((response) => {
                if (response) {
                    console.log("mc form posted")
                    console.log('response', response)
                }
                sendPetitionTracking('2021-climate-government_set_carbon_price');
                $('#signForm').hide();
                $('#signDone').fadeIn();
                // utm part

            }).catch((error) => {
                console.log(error);
                $(".loading-cover").fadeOut();
                // $('#signForm').hide();
                // $('#signDone').fadeIn();
            });
        },
        invalidHandler: function(event, validator) {
            // 'this' refers to the form
            var errors = validator.numberOfInvalids();
            if (errors) {
                console.log(errors)
                $("div.error").show();
            } else {
                $("div.error").hide();
            }
        }
    })

    $.extend($.validator.messages, {
        required: "此欄位為必填",
        email: "Email 格式錯誤",
    });


    $("#submitForm").click(function () {
        console.log($('#visible-form'))
        $('#visible-form').submit();
        console.log($('#visible-form').validate())
        
    });

}


function init() {

    if ($(window).width() <= 780) {
        $('.policy .sec__inner').attr('data-aos-anchor-placement', 'top-bottom');
    } else {
        $('.policy .sec__inner').attr('data-aos-anchor-placement', 'center-bottom');
    }
    //
    var nowScroll = $(window).scrollTop();
    $('.menu-btn').click(function (e) {
        e.preventDefault();
        nowScroll = $(window).scrollTop();
        $('.menu-btn, .nav').toggleClass('opened');
        if ($('.nav').hasClass('opened')) {

            $('body').addClass('noscroll');
        } else {
            $('body').removeClass('noscroll');
            $(window).scrollTop(nowScroll);
        }
    });

    $('.nav__link').on('click', function (e) {
        e.preventDefault();
        var goto = $(this).attr('href');
        $('html, body').animate({ scrollTop: $(goto).offset().top });
        $('.menu-btn').trigger('click');
    });

    var url = window.location.href;
    //若此規則無法取得正確分享網址，請直接把網址寫進 url
    $('#shareFB').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + url);
    $('#shareLINE').attr('href', 'https://lineit.line.me/share/ui?url=' + url);

    //scroll to
    $('#goSignUp').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 600);
    });

    AOS.init({
        duration: 550,
        anchorPlacement: 'center-bottom'
    });

    $(".line-share-section").hide();
    // utm source
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("utm_source") === "dd") {
        $(".line-share-section").show();
        $(".hide-on-dd").hide();
        $(".slider-typography").css("position", "relative");
        $(".slider-typography").css("padding-top", "15%");
        $(".line-share-img").hide();

        switch (urlParams.get("utm_content")) {
            case "tp":
                $(".line-link").attr("href", "http://act.gp/GPLINE_tp");
                $(".tp-line").show();
                break;
            case "tc":
                $(".tc-line").show();
                $(".line-link").attr("href", "http://act.gp/GPLINE_tc");
                break;
            case "ks":
                $(".ks-line").show();
                $(".line-link").attr("href", "http://act.gp/GPLINE_ks");
                break;
            default:
                $(".tp-line").show();
                $(".line-link").attr("href", "http://act.gp/GPLINE_tp");
                break
        }
    } else {
        $(".line-share-section").hide()
    }

}

/**
 * Send the tracking event to the ga
 * @param  {string} eventLabel The ga trakcing name, normally it will be the short campaign name. ex 2019-plastic_retailer
 * @param  {[type]} eventValue Could be empty
 * @return {[type]}            [description]
 */
function sendPetitionTracking(eventLabel, eventValue) {
    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
        'event': 'gaEvent',
        'eventCategory': 'petitions',
        'eventAction': 'signup',
        'eventLabel': eventLabel,
        'eventValue': eventValue
    });

    window.dataLayer.push({
        'event': 'fbqEvent',
        'contentName': eventLabel,
        'contentCategory': 'Petition Signup'
    });

    window.uetq = window.uetq || [];
    window.uetq.push('event', 'signup', { 'event_category': 'petitions', 'event_label': eventLabel, 'event_value': 0 });
}
