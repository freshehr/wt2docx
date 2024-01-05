import axios from 'axios';
import fetch from 'node-fetch'
import path from 'path';

const formatOpenEhrADUrl = (repositoryId: string, listType: string) =>
`https://tools.openehr.org/designer/api/repository/entry/list?repositoryId=${repositoryId}&cache=false&type=${listType}&depth=-1`;

const formatGHSearchUrl = (repositoryId: string) => {
  return `https://api.github.com/repos/${repositoryId}/git/trees/master?recursive=1`;
};

const formatCKMSearchUrl = (repositoryId: string) => {
  return `https://ckm.openehr.org/ckm/rest/v1/archetypes?owned-only=true&restrict-search-to-main-data=false&require-all-search-words=true&require-all-classes=false&include-subclasses=false&size=20`;
};
/*
export const getADArchetypesList = (username: string, password: string, repositoryId: string): any => {

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
export const getADTemplatesList = (username: string, password: string, repositoryId: string): any => {

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
*/

export const searchGHRepo = async (username: string, password: string, repoName: string): Promise<any> => {

  const token = btoa(username + ":" + password);

  const url:string = formatGHSearchUrl(repoName)

    try {
      // 👇️ const data: GetUsersResponse
      const { data, status } = await axios.get(
        url,
        {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        },
      );

      const files = data.tree
        .filter(file => file.type === 'blob' && file.path.endsWith('.adl'))
        .map(file =>  path.parse(file.path).name)

      console.log(JSON.stringify(files, null, 4));

      // 👇️ "response status is: 200"
      console.log('response status is: ', status);

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
        return error.message;
      } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred';
      }
    }

};

export const searchCKMRepo = async (username: string, password: string, repoName: string): Promise<any> => {

  const token = btoa(username + ":" + password);

  const url:string = formatCKMSearchUrl(repoName)

  try {
    // 👇️ const data: GetUsersResponse
    const { data, status } = await axios.get(
      url,
      {
        headers: {
          Accept: 'application/xml',
          Authorization: `BASIC ${token}`
        },
      },
    );



    // 👇️ "response status is: 200"
    console.log('response status is: ', status);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('error message: ', error.message);
      return error.message;
    } else {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
    }
  }

};
