import axios from 'axios';
import path from 'path';
import { DocBuilder } from "./DocBuilder";
import fs from "fs";

type ArchetypeProvenance = {
  archetypeId: string,
  provenance?: string,
  remoteId?: string
  semver?:string
}

type RemoteGHRepo = {
  repoTag: string,
  repoAccount: string,
  repoName: string,
  repoNamespace: string
}
export const remoteGHRepos: RemoteGHRepo[] =
  [{
      repoTag: 'intCKM',
      repoAccount: 'openEHR',
      repoName: 'CKM-mirror',
      repoNamespace: 'org.openehr'
    }]

export type ArchetypeList = ArchetypeProvenance[];

let remoteRepo: ArchetypeList = [];

const ADRootUrl = `https://tools.openehr.org/designer/api`

const formatADUrl = (repositoryId: string, listType: string) =>
`${ADRootUrl}/repository/entry/list?repositoryId=${repositoryId}&cache=false&type=${listType}&depth=-1`;

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


export const fetchADArchetype = async (archetypeId: string, repositoryId: string) => {
  try {
    // 👇️ const data: GetUsersResponse
    const url = `${ADRootUrl}/repository/archetype/get?repositoryId=${repositoryId}&archetypeId=${archetypeId}`
    const { data, status } = await axios.get(url,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
  return data

} catch (error) {
  if (axios.isAxiosError(error)) {
    console.log('error message: ', error.message);
  } else {
    console.log('unexpected error: ', error);
  }
}


}
export const searchGHRepo = async (username: string, password: string, repoAccount: string, repoName: string, repoNamespace: string): Promise<ArchetypeList> => {

//  const token = btoa(username + ":" + password);

    try {
      // 👇️ const data: GetUsersResponse
      const { data, status } = await axios.get(
        formatGHSearchUrl(`${repoAccount}/${repoName}`),
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

const cacheFileName = (repoAccount: string, repoName:string ) => `./repos/${repoAccount}_${repoName}.json`

const saveRemoteRepoCache =  async ( repoAccount: string, repoName: string, repoList: ArchetypeList) => {
  if (!fs.existsSync('repos')) {
    fs.mkdirSync('repos', { recursive: true })
  }
 const cacheFilePath :string = cacheFileName(repoAccount, repoName)
  fs.writeFileSync(cacheFilePath, JSON.stringify(repoList))
  console.log(`\n Saved : ${cacheFilePath}`)
}

const readRemoteFileCache = async (repoAccount: string, repoName : string, repoNamespace: string ,forceRefresh: boolean) => {

  const fileName = cacheFileName(repoAccount, repoName)
  const inputFileExist = fs.existsSync(fileName);

  if (inputFileExist && !forceRefresh) {
    const inDoc: string = fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' });
    remoteRepo = JSON.parse(inDoc)

  }
  else
  {
    await searchGHRepo("ian.mcnicoll", "vQum0C12K1Lx", repoAccount, repoName, repoNamespace)
      .then( result => {
        return remoteRepo = result; // Outputs: 'Hello, World!'
      })
      .catch(error => console.log("Caught Error: ", error));

    await saveRemoteRepoCache(repoAccount, repoName,remoteRepo)
  }
}

export const updateArchetypeList = async (repoAccount: string,repoName: string, repoNamespace: string, list: ArchetypeList, refreshCache: boolean) : Promise<ArchetypeList> => {

  await readRemoteFileCache(repoAccount,repoName, repoNamespace,refreshCache)

  const upDatedList: ArchetypeList = [];

    list.forEach(localItem => {

    //  upDatedList.push({...item, provenance: 'local'})
      const match = remoteRepo.find(remoteItem =>
      {
        const local: string = path.parse(remoteItem.archetypeId).name
        const remote: string = path.parse(localItem.archetypeId).name

        return local===remote
      })

      if (match)
        upDatedList.push({...localItem, provenance: 'org.openehr', remoteId: match.archetypeId})
      else
        upDatedList.push({...localItem, provenance: 'local', remoteId: '' })
    });

    return upDatedList
}
