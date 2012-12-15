function showCardType(card) {
	type = Stripe.cardType(card);
	
	if (type == "Visa") {
		$("#cardType").attr("src","resources/img/visa_24.png");
		$("#cardType").attr("alt", type);
	} else if (type == "American Express") {
		$("#cardType").attr("src","resources/img/american_express_24.png");
		$("#cardType").attr("alt", type);
	} else if (type == "JCB") {
		$("#cardType").attr("src","resources/img/jcb_24.png");
		$("#cardType").attr("alt", type);
	} else if (type == "Discover") {
		$("#cardType").attr("src","resources/img/discover_24.png");
		$("#cardType").attr("alt", type);
	} else if (type == "MasterCard") {
		$("#cardType").attr("src","resources/img/mastercard_24.png");
		$("#cardType").attr("alt", type);
	} else {
		$("#cardType").attr("src","data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==");
	}
}

function adjustStateDropdown(country) {
	if (country == "GB") {
		$("#state-label").text("County");
		$("#city-label").text("Town");
	} else {
		$("#state-label").text("Province");
		$("#city-label").text("Neighbourhood");
	}
	
	if (country == "US") {
		$("#zip-label").text("ZIP");
		$("#state-label").text("State");
		$("#state-label").text("City");
		
		$("#UIStateDropdown").css("display", "block");
		$("#UIStateBox").css("display", "none");
		
		$('#UIStateDropdown').addClass('address-state');
		$('#UIStateBox').removeClass('address-state');
	} else {
		$("#zip-label").text("Post code");
		$("#UIStateDropdown").css("display", "none");
		$("#UIStateBox").css("display", "block");
		
		$('#UIStateDropdown').removeClass('address-state');
		$('#UIStateBox').addClass('address-state');
	}
	
	fetchZIP($('.address-zip').val());
}

function fetchZIP(zip) {
	if (zip !== "") {
		$("#lookupZIP").attr("src","resources/img/spinner_24.gif");
		$('#address-details').css('opacity', '0.6');
		
		$.ajax({
			url: "lookupZIP.php?code="+zip+"&country="+$('.address-country').val(),
			dataType: 'json',
			success: function(data) {
				$("#lookupZIP").attr("src","data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==");
				$('#address-details').css('opacity', '1');
				
				$('.address-state').val(data.results.state);
				$('.address-city').val(data.results.city);
				
				$('.address-state').removeAttr('disabled', '');
				$('.address-city').removeAttr('disabled', '');
				$('.address-line1').removeAttr('disabled', '');
				$('.address-line2').removeAttr('disabled', '');
				
				if (typeof(data.results.country) != "undefined" && data.results.country !== null) {
					$("#lookupZIP").attr("src","resources/img/flag/"+data.results.country+".png");
				}
			}
		});
	}
}

Stripe.setPublishableKey('YOURKEYHERE');

$(document).ready(function() {
	$("#payment-form").submit(function(event) {
		
		if (Stripe.validateCardNumber($('.card-number').val()) == false) {
			$("#cardError").html("<b>Uh oh!</b> Seems you didn't enter a valid card number.");
			$("#cardError").css("display", "block");
			return false;
		}
		
		if (Stripe.validateCVC($('.card-cvc').val()) == false) {
			$("#cardError").html("<b>Uh oh!</b> Seems you didn't enter a valid CVC.");
			$("#cardError").css("display", "block");
			return false;
		}
		
		if (Stripe.validateExpiry($('.card-expiry-month').val(), $('.card-expiry-year').val()) == false) {
			$("#cardError").html("<b>Uh oh!</b> Seems you didn't enter a valid expiry date. Make sure it follows the MM/YYYY format");
			$("#cardError").css("display", "block");
			return false;
		}
		
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	   	if (re.test($('.user-email').val()) == false) {
	   		$("#cardError").html("<b>Uh oh!</b> Your email doesn't look valid.");
	   		$("#cardError").css("display", "block");
	   		return false;
	   	}
		
		// disable the submit button to prevent repeated clicks
		$('.submit-button').attr("disabled", "disabled");

		Stripe.createToken({
				number: $('.card-number').val(),
				cvc: $('.card-cvc').val(),
				exp_month: $('.card-expiry-month').val(),
				exp_year: $('.card-expiry-year').val(),
				name: $('.card-holdernam').val(),
				address_line1: $('.address-line1').val(),
				address_line2: $('.address-line1').val(),
				address_state: $('.address-state').val(),
				address_zip: $('.address-zip').val(),
				address_country: $('.address-country').val()
		}, stripeResponseHandler);

		// prevent the form from submitting with the default action
		return false;
	});
});

function stripeResponseHandler(status, response) {
	if (response.error) {
		// show the errors on the form
		$("#cardError").html("<b>Uh oh!</b> "+response.error.message);
		$("#cardError").css("display", "block");
		$(".submit-button").removeAttr("disabled");
	} else {
		var form$ = $("#payment-form");
		// token contains id, last4, and card type
		var token = response['id'];
		// insert the token into the form so it gets submitted to the server
		form$.append("<input type='hidden' name='stripeToken' value='" + token + "'/>");
		// and submit
		form$.get(0).submit();
	}
}