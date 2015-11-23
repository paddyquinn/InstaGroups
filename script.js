var access_token = "20203233.9e4190f.72c45bfbc5d14f24aecf3d2d85af78e3";

var submitForm = function() {
	event.preventDefault();
	var choice = $("input:radio[name=type]:checked");
	var table = $("#searchResults")[0];
	if (choice.length > 0) {
		var query = $("#search")[0].value;
		var invalid; //UI DECISION TO MAKE SURE VALID INPUT
		if (query.length > 0) {
			if (choice[0].value == "people") {
				// query instagram api for users
				invalid = /\?/; // check for question marks
				if (!invalid.test(query)) {
					$.ajax({url: "https://api.instagram.com/v1/users/search?q=" + query + "&access_token=" + access_token, 
							dataType: "jsonp",
							success: handleUsers
					});
				} else {
					table.innerHTML = "Invalid input!";
				}
			} else if (choice[0].value == "tags") {
				// query instagram api for media based on tag
				invalid = /[\[\]\\\/~`!@#$%^&*()-=+{}|;':"<>,.? ]/; // regular expression for invalid input
				if (!invalid.test(query)) {
					$.ajax({url: "https://api.instagram.com/v1/tags/" + query + "/media/recent?access_token=" + access_token, 
							dataType: "jsonp",
							success: handleMedia
					});
				} else {
					table.innerHTML = "Invalid input!";
				}
			} else if (choice[0].value == "places") {
				// query google maps api for latitude and longitude of search query
				invalid = /\?/; // check for question marks
				if (!invalid.test(query)) {
					$.ajax({url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + query + "&key=AIzaSyAEl6rZYUeweCN-LTlruBSiWFOPHlC59P8", 
							dataType: "json",
							success: searchOnCoordinates
					});
				} else {
					table.innerHTML = "Invalid input!";
				}
			}
		}
	} else {
		table.innerHTML = "Please select a filter!";
	}
};

var handleUsers = function(data) {
	var table = $("#searchResults")[0];
	table.innerHTML = "";
	var row;
	var cell;
	// make sure correct data is returned
	if (data.meta.code != 200) {
		row = table.insertRow(0);
		cell = row.insertCell(0);
		cell.innerHTML = data.meta.error_message;
	} else {
		var users = data.data;
		// handle case when no data is returned
		if (users.length < 1) {
			row = table.insertRow(0);
			cell = row.insertCell(0);
			cell.innerHTML = "No results."
		} else {
			var index = 0;
			var rowCount = 0;
			var cellCount;
			var user;
			var content = ""
			while (index < 20 && index < users.length) { // UI DESIGN DECISION TO HANDLE 20!!!
				user = users[index];
				content = "<img src=\"" + 
						  user.profile_picture + 
						  "\"><br><a href=\"https://www.instagram.com/" 
						  + user.username +
						  "\">Instagram</a><button onclick=\"getRecent(" + user.id + ")\">Recent Uploads</button>";
				if (index % 5 == 0) { // add a new row after 5 cells
					row = table.insertRow(rowCount);
					cellCount = 0;
					cell = row.insertCell(cellCount);
					rowCount++;
				} else {
					cell = row.insertCell(cellCount);
				}
				cellCount++;
				cell.innerHTML = content;
				content = "";
				index++;
			}
		}
	}
};

var handleMedia = function(data) {
	var table;
	if (this.url.indexOf("https://api.instagram.com/v1/users/") < 0) {
		table = $("#searchResults")[0];
	} else {
		table = $("#userResults")[0];
		$("#user")[0].innerHTML = data.data[0].user.username; //"User" SHOWS UP AT FIRST ON USERPAGE
	}
	table.innerHTML = "";
	var row;
	var cell;
	// make sure correct data is returned
	if (data.meta.code != 200) {
		row = table.insertRow(0);
		cell = row.insertCell(0);
		cell.innerHTML = data.meta.error_message;
	} else {
		var media = data.data;
		var content = "";
		// handle case when no data is returned
		if (media.length < 1) {
			row = table.insertRow(0);
			cell = row.insertCell(0);
			cell.innerHTML = "No results."
		} else {
			var index = 0;
			var pv;
			while (index < media.length) {
				pv = media[index];
				if (pv.type == "image") {
					content += "<img src=\"" +
				    pv.images.standard_resolution.url +
			  	    "\">";
				} else if (pv.type == "video") { // handles videos
					content += "<video controls><source src=\"" +
			   	    pv.videos.standard_resolution.url +
				    "\" type=\"video/mp4\">Your browser does not support the video tag</video>";
				}
				//ADD POSTING USER -> SO THEY CAN BE ADDED TO GROUP (UI DECISION)
				if (pv.caption != null) {
					content += "<br>Caption: " + pv.caption.text;
				} //UI DECISION NOT TO DISPLAY ANYTHING WHEN THERE IS NO CAPTION
				content += "<br>NumLikes: " +
				   		   pv.likes.count +
						   "<br>Time: " +
						   convert(pv.created_time) +
						   "<br><a href=\"" +
						   pv.link +
						   "\">Instagram</a>";
				//UI DECISION TO NOT HAVE A SEPARATE THING FOR TAGS!!!!COMMENTS CAN RESULT IN A PIC BEING TAGGED - RETHINK DECISION???
				row = table.insertRow(index++);
				cell = row.insertCell(0);
				cell.innerHTML = content;
				content = "";
			}
		}
	}
};

var convert = function(millis) { //TODO!!!
	return millis;
}

var getRecent = function(id) {
	$.ajax({url: "https://api.instagram.com/v1/users/" + id + "/media/recent/?access_token=" + access_token,
			dataType: "jsonp",
			success: handleMedia				
	});
	user();
};

var searchOnCoordinates = function(data) {
	if (data.status == "OK") {
		var coordinates = data.results[0].geometry.location;
		var lat = coordinates.lat;
		var lng = coordinates.lng;
		$.ajax({url: "https://api.instagram.com/v1/media/search?lat=" + lat + "&lng=" + lng + "&access_token=" + access_token,
				dataType: "jsonp",
				success: handleMedia				
		});
	} else {
		var table = $("#searchResults")[0];
		table.innerHTML = "";
		var row = table.insertRow(0);
		var cell = row.insertCell(0);
		cell.innerHTML = "No results.";
	}
};
var createTable = function() {
	var table = $("#groups")[0];
	console.log($("#groups"));
	var rows = table.rows;
	var rowIndex = rows.length - 1;
	var row = rows[rowIndex];
	var cellIndex = row.cells.length - 1;
	var cell;
	if (cellIndex == 4) { // add a new row after 5 cells 
		rowIndex++;
		row = table.insertRow(rowIndex);
		cellIndex = 0;
		cell = row.insertCell(cellIndex);
		cell.innerHTML = row.previousElementSibling.cells[4].innerHTML;
		row.previousElementSibling.cells[4].innerHTML = "group";
	} else {
		cellIndex++;
		cell = row.insertCell(cellIndex);
		cell.innerHTML = cell.previousElementSibling.innerHTML;
		cell.previousElementSibling.innerHTML = "group";
	}
};

var search = function() {
	$("#groupspage")[0].hidden = true;
	$("#userpage")[0].hidden = true;
	$("#searchpage")[0].hidden = false;
};

var groups = function() {
	$("#searchpage")[0].hidden = true;
	$("#userpage")[0].hidden = true;
	$("#groupspage")[0].hidden = false;
};

var user = function() {
	$("#searchpage")[0].hidden = true;
	$("#groupspage")[0].hidden = true;
	$("#userpage")[0].hidden = false;
};