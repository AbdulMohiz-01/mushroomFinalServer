// Function to display selected image
document.getElementById("image").addEventListener("change", function (e) {
  var image = document.getElementById("selected-image");
  image.src = URL.createObjectURL(e.target.files[0]);
  image.classList.remove("d-none");
});

// Function to handle prediction
async function predict() {
  var fileInput = document.getElementById("image");
  var file = fileInput.files[0];
  var formData = new FormData();
  formData.append("image", file);

  // Show loading spinner
  document.querySelector(".loading").style.display = "inline-block";

  const response = await fetch("/RetinaAPI/v1/preprocess", {
    method: "POST",
    body: formData,
  });
  // Check if response is OK (status code 200)
  if (response.ok) {
    // Read the response as a blob (binary data)
    const blob = await response.blob();

    // Create a URL for the blob object
    const imageURL = URL.createObjectURL(blob);

    // Display the preprocessed image
    document.getElementById("preprocessed-image").src = imageURL;

    // Show the preprocessed image container
    document.querySelector(".dNone").style.display = "block";
  } else {
    // Handle errors
    console.error("Error:", response.status);
    // You can display an error message to the user if needed
  }

  const response_xai = await fetch("/RetinaAPI/v1/xai");
  // Check if response is OK (status code 200)
  if (response_xai.ok) {
    // Read the response as a blob (binary data)
    const blob = await response_xai.blob();

    // Create a URL for the blob object
    const imageURL = URL.createObjectURL(blob);

    // Display the preprocessed image
    document.getElementById("Gradecam-image").src = imageURL;

    // Show the preprocessed image container
    document.querySelector(".dNone1").style.display = "block";
  } else {
    // Handle errors
    console.error("Error:", response_xai.status);
    // You can display an error message to the user if needed
  }

  fetch("/RetinaAPI/v1/predict", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      // Hide loading spinner
      document.querySelector(".loading").style.display = "none";
      // Show prediction result
      document.getElementById("prediction-result").classList.remove("d-none");
      document.getElementById("result").innerText =
        "Predicted Class: " + data.predicted_class;
      document.getElementById("confidence").innerText =
        data.confidence.toFixed(2);

      // Display bar graph based on probabilities
      var labels = [
        "0 - No DR",
        "1 - Mild",
        "2 - Moderate",
        "3 - Severe",
        "4 - Proliferative DR",
        "5 - Invalid Image",
      ]; // Labels for each class
      displayBarGraph(labels, data.predictions);
    })
    .catch((error) => {
      // Hide loading spinner
      document.querySelector(".loading").style.display = "none";
      console.error("Error:", error);
      alert("Error occurred while predicting.");
    });
}

// Function to clear selected image
function clearImage() {
  document.getElementById("image").value = "";
  document.getElementById("selected-image").src = "#";
  document.getElementById("selected-image").classList.add("d-none");
  // Hide prediction result
  document.getElementById("prediction-result").classList.add("d-none");
  // Hide preprocessed image container
  document.querySelector(".dNone").style.display = "none";
}

// Function to display bar graph
function displayBarGraph(labels, values) {
  var ctx = document.getElementById("barGraph").getContext("2d");

  // Check if a chart instance already exists for the 'barGraph' canvas
  if (window.myBarChart instanceof Chart) {
    // If a chart instance exists, destroy it before creating a new one
    window.myBarChart.destroy();
  }

  // Create new Chart instance
  window.myBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Probability",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
