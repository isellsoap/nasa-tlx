$(document).ready(function() {

	/* functions */

	/* randomly shuffle an array */

	function shuffle(array) {
		var top = array.length,
			tmp, current;

		if(top) {
			while(--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = array[current];
				array[current] = array[top];
				array[top] = tmp;
			}
		}

		return array;
	}

	/* create an array of pairs. formula: n! / ( (n - k)! * k! ) */

	function pair_combinator(array) {

		var length = array.length,
			result = [],
			counter = 0,
			i, j;

		for (i = 0; i < length; i++) {
			for (j = i; j < length - 1; j++) {
				result[counter] = shuffle([ [ array[i][0], array[i][1] ], [ array[j + 1][0], array[j + 1][1] ] ]);
				counter++;
			}
		}

		return shuffle(result);

	}

	/* creates an array with a given length and fills it up with a given value */

	function new_filled_array(length, value) {
		var array = new Array(length);
		while (--length >= 0) {
			array[length] = value;
		}
		return array;
	}

	/* variables */

	var settings,
		random_pairs,
		data_object,
		counter,
		pairs_length,
		final_result = [],
		demands = [
			["md", "Mental demand"],
			["pd", "Physical demand"],
			["td", "Temporal demand"],
			["op", "Performance"],
			["ef", "Effort"],
			["fr", "Frustration"]
		],
		tableoutput = "",
		no_score = "–";

	/* hide future steps */

	$(".step_1, .step_2, .step_3, .step_4").hide();

	$("<p>No data available yet.</p>").insertAfter(".step_0 h2");

	/* step 0 */

	$(".step_0 button").click(function() {
		$(".step_0").hide();
		$(".step_1").show();
	});

	/* step 1 */

	$(".step_1 input[type='submit']").live("click", function() {

		// remove error paragraphs at first (if proband error is shown and error occurs on task, the proband error disappears)
		$(".step_1 .cf p").remove();

		// value of input[type="text"]
		var value = $.trim($(this).prev().val().replace(/ +(?= )/g,'')),
			// formatted value for "id" and "for" attributes
			formatted_value = value.toLowerCase().split(' ').join('_'),
			// "subject" for error message ("proband" or "task")
			subject = $(this).siblings("input[type='text']").attr("id").split('create_').join(''),
			proband_exists = false,
			error_message = "";

		// check if proband already exists
		$(this).parent().parent().find(".list label").each(function() {
			if( $(this).html().toLowerCase() === value.toLowerCase() ) {
				proband_exists = true;
			}
			return;
		});

		// if input has an actual character in it
		if ( value ) {
			if ( proband_exists ) {
				error_message += "Error. This " + subject + " already exists.";
			} else {
				$("<div><input type='radio' name='" + subject + "s' id='" + formatted_value + "'> <label for='" + formatted_value + "'>" + value + "</label></div>")
					.appendTo($(this).parent().parent().find(".list >:first-child"));
				// reset value of input after proband or task was created
				$(this).siblings("input[type='text']").val("");
			}
		} else {
			error_message += "Error. No characters entered.";
		}

		if ( error_message ) {
			$(this).parent().append("<p class='error'>" + error_message + "</p>");
		}
		return false;
	});

	$(".step_1 .go_back a").click(function() {
		$(".step_1 .cf p").remove();
		$(".step_1").hide();
		$(".step_0").show();
		return false;
	});

	$(".step_1 button").live("click", function() {
		settings = [];
		// store values of checked radio buttons in settings array
		$("input[type='radio']:checked").each(function(i) {
			settings.push($(this).attr("id"), $(this).siblings("label").html());
		});

		// prepare steps for step 2

		// set default slider setting
		$(".slider").slider({
			max: 100,
			min: 1,
			step: 5,
			value: 50
		});

		data_object = {
			"button_clicks": new_filled_array(demands.length, 0),
			"slider_value": []
		};

		// reset input values and thrown error paragraphs caused by input submits
		$(".step_1 input[type='text']").val("");
		$(".step_1 .cf p").remove();

		// check if proband already completed a task
		var proband_exists = false,
			task_exists = false;

		// iterate probands
		for ( var i = 0, length = final_result.length; i < length; i++ ) {
			// if proband exists
			if ( final_result[i].proband === settings[0] ) {
				proband_exists = true;
				// iterate tasks
				for ( var j = 0, tasks_length = final_result[i].tasks.length; j < tasks_length; j++) {
					// if task exists
					if (final_result[i].tasks[j].name === settings[2]) {
						task_exists = true;
						break;
					}
				}
				break;
			}
		}

		// if proband doesn’t exist make first push to array and continue to step 2
		if ( !proband_exists ) {
			final_result.push(
				{
					proband: settings[0],
					tasks: [
						{
							name: settings[2],
							data: {}
						}
					]
				}
			);
			$(".step_1").hide();
			$(".step_2").show();
			$("<ul class='info'><li><strong>Proband:</strong> " + settings[1] + "</li><li><strong>Task:</strong> " + settings[3] + "</li></ul>").insertAfter("h2");
		} else {
			// if proband didn’t complete the task make push to tasks array and continue to step 2
			if (!task_exists) {
				final_result[i].tasks.push(
					{
						name: settings[2],
						data: {}
					}
				);
				$(".step_1").hide();
				$(".step_2").show();
				$("<ul class='info'><li><strong>Proband:</strong> " + settings[1] + "</li><li><strong>Task:</strong> " + settings[3] + "</li></ul>").insertAfter("h2");			} else {
				// if proband already did complete the task trough an error
				var error_paragraph = "Proband <strong>" + settings[1] + "</strong> already accomplished task <strong>" + settings[3] + "</strong>.";
				if($(".step_1 .cf > .error").length) {
					$(".step_1 .cf > .error").html(error_paragraph);
				} else {
					$(".step_1 .cf").append("<p class='error'>" + error_paragraph + "</p>");
				}
			}
		}

	});

	/* step 2 */

	$(".step_2 button").live("click", function() {

		// save slider values
		$(".slider").each(function(i) {
			data_object["slider_value"][i] = $(this).slider("option", "value");
		});

		// prepare stuff for step 3
		counter = 0;
		random_pairs = pair_combinator(demands);
		pairs_length = random_pairs.length;

		$(".step_2").hide();
		$(".step_3").show();

		// start button for pairs
		if ( $(".step_3").find("div").length ) {
			$(".step_3 div").html("<button>Start</button>");
		} else {
			$(".step_3").append("<div><button>Start</button></div>");
		}
		// remove/reset "to go" counter
		$(".step_3 .to_go").remove();

	});

	/* step 3 */

	$(".step_3 button").live("click", function() {

		// if a pair button is clicked (start button hasn't got class attribute)
		if( $(this).attr("class") ) {
			pairs_length--;
			counter++;
			// count clicks for corresponding demand
			for ( var i = 0; i < demands.length; i++ ) {
				if ( $(this).attr("class") === demands[i][0] ) {
					data_object["button_clicks"][i] += 1;
					break;
				}
			}
		}

		// continue as long as there are reaming pairs to be clicked
		if ( pairs_length ) {
			// show the next pair
			$(this)
				.parent()
				.html("<button class='" + random_pairs[counter][0][0] + "'>" + random_pairs[counter][0][1] + "</button> or " + "<button class='" + random_pairs[counter][1][0] + "'>" + random_pairs[counter][1][1] + "</button>");
			// "to go" counter
			if ( !$(".step_3").find(".to_go").length ) {
				$(".step_3").append("<p class='highlight to_go'></p>");
			}
			$(".step_3 .to_go").html("<strong>" + pairs_length + "</strong> to go!");
		} else {
			var sum = 0,
				weights = 0,
				output = "<table><thead><tr><th>Demand</th><th>Rating</th><th>Weight</th><th>Product</th></tr></thead><tbody>";
			for (var j = 0; j < demands.length; j++ ) {
				output += "<tr><td>" + demands[j][1] + "</td><td>" + data_object["slider_value"][j] + "</td><td>" + data_object["button_clicks"][j] + "</td><td>" + data_object["slider_value"][j] * data_object["button_clicks"][j] + "</td></tr>";
				sum += data_object["slider_value"][j] * data_object["button_clicks"][j];
				weights += data_object["button_clicks"][j];
			}
			output += "<tr><th colspan='3'>Product sum</th><td>" + sum + "</td></tr>";
			output += "<tr><th colspan='3'>Total weights</th><td>" + weights + "</td></tr>";
			output += "<tr><th colspan='3'>Rounded TLX score</th><td><strong>" + Math.round(sum/weights) + "</strong></td></tr></tbody></table>";

			$(".step_4 div").html(output);

			// save computed data to array

			// iterate probands
			for (var i = 0; i < final_result.length; i++) {
				// if proband already saved
				if (final_result[i].proband === settings[0]) {
					// iterate tasks
					for (var j = 0; j < final_result[i].tasks.length; j++) {
						if (final_result[i].tasks[j].name === settings[2]) {
							final_result[i].tasks[j].data = data_object;
							final_result[i].tasks[j].tlx = Math.round(sum/weights);
							final_result[i].tasks[j].output = output;
							break;
						}
					}
					break;
				}
			}

			// table output for overview page

			tableoutput = "<thead><tr><th>Probands</th>";

			$(".step_1 .second .list label").each(function(i) {
				tableoutput += "<th>" + $(this).html() + "</th>";
			});

			tableoutput += "</thead><tbody>";

			for (var i = 0; i < final_result.length; i++) {
				tableoutput += "<tr><th>" + $(".step_1 label[for='" + final_result[i].proband + "']").html() + "</th>";
				$(".step_1 .second form label").each(function() {
					var flaggy = false;
					for(var j = 0; j < final_result[i].tasks.length; j++) {
						if($(this).attr("for") === final_result[i].tasks[j].name) {
							tableoutput += "<td>" + final_result[i].tasks[j].tlx + "</td>";
							flaggy = true;
							break;
						}
					}
					if(!flaggy) {
						tableoutput += "<td>" + no_score + "</td>";
					}

				});

			}

			$(".step_3").hide();
			$(".step_4").show();

		}

	}); // step 3 button

	/* step 4 */

	$(".step_4 button").live("click", function() {
		$(".info").remove();
		$(".step_0 p").remove();

		// add table to overview page

		if($(".step_0 table").length) {
			$(".step_0 table").html(tableoutput);
		} else {
			$("<table class='test'>" + tableoutput + "</tbody></table>").insertAfter('.step_0 h2');
		}

		// iterate through table columns

		var result = new_filled_array($(".step_1 .second div div").length, 0);
		var supercounter = new_filled_array(result.length, 0);

		for(var i = 0; i < result.length; i++) {
			$(".test tbody tr").children("td:nth-child(" + (i + 2) + ")").each(function() {
				if($(this).html() !== no_score) {
					result[i] += +$(this).html();
					supercounter[i] += 1;
				}
			});
		}

		var deviation,
			average_tlx,
			more_tableoutput = "<tfoot><tr><th>Avg. TLX (± standard deviation)</th>";

		// calculate average tlx

		for(var j = 0; j < result.length; j++) {
			average_tlx = (!supercounter[j]) ? no_score : parseFloat((result[j]/supercounter[j]).toFixed(2));
			more_tableoutput += "<td>" + average_tlx + "</td>";
		}

		more_tableoutput += "</tr></tfoot>";

		$(more_tableoutput).insertAfter(".step_0 thead");

		// standard deviation
		var min_array = [],
			max_array = [],
			avg_array = [],
			label_array = [],
			arr_counter = 0;

		for(var k = 0; k < result.length; k++) {
			deviation = 0;
			$(".test tbody tr").children("td:nth-child(" + (k + 2) + ")").each(function() {
				if($(this).html() !== no_score) {
					deviation += Math.pow(+$(this).html() - +$(".test tfoot td:nth-child(" + (k + 2) + ")").html(), 2) ;
				}
			});

			if ($(".test tfoot td:nth-child(" + (k + 2) + ")").html() !== no_score && deviation) {
				min_array[arr_counter] = +parseFloat(+$(".test tfoot td:nth-child(" + (k + 2) + ")").html() - parseFloat(Math.sqrt(deviation).toFixed(2))).toFixed(2);
				max_array[arr_counter] = +parseFloat(+$(".test tfoot td:nth-child(" + (k + 2) + ")").html() + parseFloat(Math.sqrt(deviation).toFixed(2))).toFixed(2);
				avg_array[arr_counter] = +parseFloat(+$(".test tfoot td:nth-child(" + (k + 2) + ")").html()).toFixed(2);
				label_array[arr_counter] = $(".test thead th:nth-child(" + (k + 2) + ")").html();
				arr_counter++;
			}
			$(".test tfoot td:nth-child(" + (k + 2) + ")").append((deviation) ? " (± " + parseFloat(Math.sqrt(deviation).toFixed(2)) + ")" : "");
		}

		// show chart if there are at least two standard deviations

		if( min_array.length > 1 ) {

			var chart,
				options = {
					chart: {
						animation: true,
						defaultSeriesType: "line",
						renderTo: "container"
					},
					credits:{
						enabled:false
					},
					title: {
						text: ""
					},
				tooltip: {
					borderWidth:1,
					headerFormat: '<b>{point.key}</b><br>',
					pointFormat: '<div><span style="color: {series.color}">{series.name}:</span> {point.y}</div>',
					useHTML: true,
					crosshairs: true,
					shared: true
				},
				legend: {
					layout:'vertical',
					align:'right',
					verticalAlign:'middle',
					x:0,
					y:0,
					borderWidth:0
				},
				plotOptions: {
					series: {
						shadow: false,
						lineWidth:1,
						marker: {
							enabled: false,
							symbol: 'circle',
							radius: 1,
							states: {
								hover: {
									enabled: true
								}
							}
						}
					}
				},
				xAxis: {
					categories: label_array,
					tickmarkPlacement: 'on',
					labels: {
						y: 20
					},
					title: {
						text: 'Tasks',
						margin: 10
					}
				},
				yAxis: {
					title: {
						text: 'TLX score',
						margin: 10
					},
					min: null,
					startOnTick:false
				},
				series: [{
					name: 'Max. deviation',
					data: max_array
				}, {
					name: 'Average TLX',
					data: avg_array,
					lineWidth:2
				}, {
					name: 'Min. deviation',
					data: min_array
				}]
			};

			chart = new Highcharts.Chart(options);

		}

		$(".step_4").hide();
		$(".step_0").show();

	}); // step 4 button

});