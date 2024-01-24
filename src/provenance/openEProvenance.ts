import axios from 'axios';
import path from 'path';
import { DocBuilder } from '../DocBuilder'
import fs from "fs";

export type ArchetypeProvenance = {
  archetypeId: string,
  provenance?: string,
  semver?:string
}

export type ArchetypeList = ArchetypeProvenance[];

let remoteRepo: ArchetypeList = [];

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

export const searchGHRepo = async (username: string, password: string, repoName: string, repoNamespace: string): Promise<ArchetypeList> => {

//  const token = btoa(username + ":" + password);

    try {
      // 👇️ const data: GetUsersResponse
      const { data, status } = await axios.get(
        formatGHSearchUrl(repoName),
        {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        },
      );

      const files = data.tree.filter(file => file.type === 'blob' && file.path.endsWith('.adl'))
      return files.map(file =>  {
        return { archetypeId: path.parse(file.path).name, provenance: repoNamespace }
      })

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message);
      } else {
        console.log('unexpected error: ', error);
      }
    }

};

export const searchCKMRepo = async (username: string, password: string, repoName: string): Promise<any> => {

  const token = btoa(username + ":" + password);
  const url:string = formatCKMSearchUrl(repoName)
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
    return data;
};

const cacheFileName = (repoName:string ) => `./repos/${repoName}.json`

const saveRemoteRepoCache =  async ( repoName: string, repoList: ArchetypeList) => {
  fs.writeFileSync(cacheFileName(repoName), JSON.stringify(repoList))
  console.log(`\n Saved : ${cacheFileName(repoName)}`)
}

const readRemoteFileCache = async (repoName : string, repoNamespace: string ,forceRefresh: boolean) => {

  const fileName = cacheFileName(repoName)
  const inputFileExist = fs.existsSync(fileName);

  if (!inputFileExist || forceRefresh) {
    refreshGHList(repoName, repoNamespace)
    await saveRemoteRepoCache(repoName,remoteRepo)
  }
  else
  {
    const inDoc: string = fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' });
    remoteRepo = JSON.parse(inDoc)
  }
}

const refreshGHList =  (repoName: string, repoNamespace: string): void => {

  searchGHRepo("ian.mcnicoll", "vQum0C12K1Lx", repoName, repoNamespace)
    .then( result => {
      console.log('remoteRepo: ', result)
      return remoteRepo = result; // Outputs: 'Hello, World!'
    })
    .catch(error => console.log("Caught Error: ", error));

}

export const updateArchetypeList = async (repoName: string, repoNamespace: string, list: ArchetypeList, refreshCache: boolean) : Promise<ArchetypeList> => {

  await readRemoteFileCache(repoName, repoNamespace,refreshCache)

  const upDatedList: ArchetypeList = [];

    list.forEach(item => {

      const match = remoteRepo.find(element => element.archetypeId === item.archetypeId);

      if (match)
        upDatedList.push(match)
      else
        upDatedList.push(item)
    });

    return upDatedList
}

