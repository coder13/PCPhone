var app = {
	currentContact:''
}, phone = {
	number: 5092218219,
	conversations: {}
}, client = {
	connected: false
};

$(document).ready(function() {

	client.iosocket = io.connect();

	client.iosocket.on("connect", function () {
		$("#connection").removeClass('disconnected');
		$("#connection").addClass('connected');
		client.connected = true;
	});

	client.iosocket.on("disconnect", function() {
		$("#connection").removeClass('connected');
		$("#connection").addClass('disconnected');
		client.connected = false;
	});

	client.iosocket.on("update", function(data) {
		data = JSON.parse(data);
		if (data.phone) {
			phone = data.phone;
			update();
		} else {
			console.log(data.property, data.value);
			phone[data.property] = data.value;
			update(data.property);
		}
	});

	client.iosocket.on("message", function(data) {
		console.log('received');
		data = JSON.parse(data);
		data.type = data.type?data.type:'received';
		console.log(data);

		phone.conversations[data.from].messages.push({type: data.type, content: data.content});
		addContact(data.from);

		addMessage(data.from, data.content, data.type);
	});

	client.iosocket.on("contact", function(data) {
		contact = JSON.parse(data);
		console.log(contact);
		addContact(contact);
	});

	$("#connection").on("click", function(data) {
		client.iosocket.emit('update');
	});


});

function addContact(contact) {
	if (phone.contacts.indexOf(contact) == -1) {
		console.log('adding contact ' + contact);
		
		contact.element = $("<div/>", {id: contact, html: contact})
		.addClass('contact').on('click', function (event) {
			showConversation(contact);
		}).appendTo("#contacts");

		phone.contacts.push(contact);
		phone.conversations[contact] = {messages: []};
	}
}

function update(which) {
	if (!which) {
		$("#battery").text(phone.battery);
		$("#uptime").text(phone.uptime?time(phone.uptime) + "seconds":"");
	} else {
		if (which == "uptime")
			$("#uptime").text(phone.uptime?time(phone.uptime):"");
		else if (which == "contacts") {
			$('.contact').not('#head').remove();

			phone.conversations.forEach(function (i) {
				console.log(i);
			});
		} else {
			$("#" + which).text(phone[which]);
		}
	}
}

function time(t) {
	seconds = t % 60;
	minutes = Math.round(t/60)%60;
	hours = Math.round(t/3600)%24;
	days = Math.round(t/86400);
	return (days?days + " days ":"") + (hours?hours + " hours ":"") +
	(minutes?minutes + " minutes ":"") + (seconds?seconds + " seconds ":"");
}
 
function showConversation(who) {
	if (app.currentContact != '') {
		return;
	}
	app.currentContact = who;
	$('<h4/>', {id: who, html: who}).addClass('conversation').appendTo("#conversation");
	$('<ul/>', {id: 'messages'}).appendTo("#conversation");

	phone.conversations[who].messages.forEach(function (e) {
		console.log(e);
		($('<li/>').html(e.content).addClass('message')
		.addClass(e.type)).appendTo('ul#messages');
	});

	$('<textarea class="conversation"></textarea>').appendTo("#conversation");
	
}

function addMessage(from, content, type) {
	if (app.currentContact == '') {
		return;
	}
	console.log(from, content);
	$('<li/>').html(content).addClass('message')
		.addClass(type).appendTo('ul#messages');
}

