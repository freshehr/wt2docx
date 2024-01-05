import fetch from "node-fetch";

const formatOpenEhrADUrl = (repositoryId: string, listType: string) => {
  return `https://tools.openehr.org/designer/api/repository/entry/list?repositoryId=${repositoryId}&cache=false&type=${listType}&depth=-1`;
};

const getADArchetypesList = (username: string, password: string, repositoryId: string): any => {

  const token = btoa(username + ":" + password);
  fetch(formatOpenEhrADUrl(repositoryId, "archetype"), {
    method: "GET", // or 'POST'
    headers: {
      "Content-Type": "application/json",
      "Authorization": `BASIC ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
        console.log(data);
      }
    )
    .catch((error) => {
      console.error("Error:", error);
    });
  //    .map((res) => this.extractDataFromLists(res).json())
};

const getADTemplatesList = (username: string, password: string, repositoryId: string): any => {

  const token = btoa(username + ":" + password);
  fetch(formatOpenEhrADUrl(repositoryId, "template"), {
    method: "GET", // or 'POST'
    headers: {
      "Content-Type": "application/json",
      "Authorization": `BASIC ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
        console.log(data);
      }
    )
    .catch((error) => {
      console.error("Error:", error);
    });
  //    .map((res) => this.extractDataFromLists(res).json())

};


