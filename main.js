let currentPage = 1;
let perPage = 10;
let lastPage = 1;
let searchTerm;

function fetchRepositories() {
  searchTerm = $("#search").val();
  const username = $("#username").val();
  if (!username) {
    alert("Please enter a GitHub username.");
    return;
  }

  perPage = $("#perPageSelect").val(); // Update perPage value

  $.ajax({
    url: `https://api.github.com/users/${username}`,
    method: "GET",
    success: function (ownerData) {
      // Display owner information
      displayOwnerInfo(ownerData);

      if (searchTerm) {
        performSearch();
      } else {
        fetchUserRepositories(username);
      }
    },
    error: function (error) {
      alert(`Error fetching owner information: ${error.responseText}`);
    },
  });
}

function fetchUserRepositories(username) {
  $.ajax({
    url: `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`,
    method: "GET",
    beforeSend: function () {
       $("#repositories").empty(); // Clear previous results
      $("#pagination").hide(); // Hide pagination during loading
      showLoader();
    },
    success: function (data, textStatus, xhr) {
      hideLoader();
      lastPage = extractLastPage(xhr.getResponseHeader("Link"));
      displayRepositories(data);
      displayPagination();
    },
    error: function (error) {
      hideLoader();
      alert(`Error fetching repositories: ${error.responseText}`);
    },
  });
}

function performSearch() {
  // Use the searchTerm variable here
  searchTerm = $("#search").val();
  const username = $("#username").val();

  $.ajax({
    url: `https://api.github.com/search/repositories?q=${searchTerm}+user:${username}+in:name,description,readme&per_page=${perPage}&page=${currentPage}`,
    method: "GET",
    beforeSend: function () {
       $("#repositories").empty(); // Clear previous results
      $("#pagination").hide(); // Hide pagination during loading
      showLoader();
    },
    success: function (data, textStatus, xhr) {
      hideLoader();
      lastPage = extractLastPage(xhr.getResponseHeader("Link"));
      displayRepositories(data.items);
      displayPagination(lastPage);
    },
    error: function (error) {
      hideLoader();
      alert(`Error fetching repositories: ${error.responseText}`);
    },
  });
}
function showLoader() {
  // Show the loader when an API call is in progress
  $("#loader").show();
}

function hideLoader() {
  // Hide the loader when the API call is complete
  $("#loader").hide();
}
function extractLastPage(linkHeader) {
  if (!linkHeader) {
    return 1; // If no Link header is present, assume a single page
  }

  const links = linkHeader.split(", ");
  const lastPageLink = links.find((link) => link.includes('rel="last"'));
  if (lastPageLink) {
    const match = lastPageLink.match(/&page=(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return 1; // Default to 1 if unable to extract last page
}
function displayOwnerInfo(ownerData) {
  const ownerInfoContainer = $("#owner-info");
  // Modify this based on the actual data you want to display
  ownerInfoContainer.html(`
    <div class=" row">
    <div class="col-md-4">
    
    <img src="${ownerData.avatar_url}" alt="${ownerData.login}'s Avatar" class="img-fluid rounded-circle ">
    </div>
    <div class="col-md-8">
    <h3>${ownerData.name}</h3>
    <p>${ownerData.bio}</p>
    <p>Twitter: <a href="${ownerData.twitter_url}" target="_blank">${ownerData.twitter_url}</a></p>
    <p>Website: <a href="${ownerData.website_url}" target="_blank">${ownerData.website_url}</a></p>
    <p class="mb-2">Location: ${ownerData.location}</p>
    <a href="${ownerData.html_url}" target="_blank">View on GitHub</a>
    </div>
    </div>
  `);
}

function displayRepositories(repositories) {
  const repoContainer = $("#repositories");

  repositories.forEach((repo) => {
    const repoCard = `<div class="col-md-4 repo-card">
                        <div class="card">
                          <div class="card-body">
                            <h5 class="card-title">${repo.name}</h5>
                            <p class="card-text">${
                              repo.description || "No description available"
                            }</p>
                            <div class="topics-buttons"></div>
                            
                          </div>
                        </div>
                      </div>`;
    const $repoCard = $(repoCard);
    repo.topics.forEach((topic) => {
      const $topicButton = $("<button>", {
        class: "btn btn-secondary m-2",
        text: topic,
      });
      $repoCard.find(".topics-buttons").append($topicButton);
    });

    repoContainer.append($repoCard);
  });
  $("#pagination").show();
}
function displayPagination() {
  const paginationContainer = $(".pagination");
  paginationContainer.empty(); // Clear previous pagination links

  const prevButton = `<li class="page-item ${
    currentPage === 1 ? "disabled" : ""
  }" onclick="changePage(${currentPage - 1})">
                          <a class="page-link" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                          </a>
                        </li>`;
  paginationContainer.append(prevButton);

  for (let i = 1; i <= lastPage; i++) {
    const pageItem = `<li class="page-item ${
      i === currentPage ? "active" : ""
    }" onclick="changePage(${i})">
                          <a class="page-link">${i}</a>
                        </li>`;
    paginationContainer.append(pageItem);
  }

  const nextButton = `<li class="page-item ${
    currentPage === lastPage ? "disabled" : ""
  }" onclick="changePage(${currentPage + 1})">
                          <a class="page-link" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                          </a>
                        </li>`;
  paginationContainer.append(nextButton);
}

function changePage(page) {
  if (page >= 1 && page <= lastPage) {
    currentPage = page;
    if (searchTerm) {
      performSearch();
    } else {
      fetchUserRepositories($("#username").val());
    }
  }
}
 
function updatePerPage() {
  perPage = $("#perPageSelect").val();
  fetchRepositories();
}