import axios from 'axios';
import path from 'path';
import { TemplateNode } from '../TemplateNodes';

export type ArchetypeProvenance = {
  archetypeId: string,
  originalNamespace?: string,
  custodianNamespace?: string,
  semver?:string,
  lifecycleStatus?:string
}

type RemoteGHRepo = {
  repoTag: string,
  repoAccount: string,
  repoName: string,
  repoNamespace: string
}

export type ArchetypeList = ArchetypeProvenance[];

const archetypeList: ArchetypeList = []

const formalPublicationNamespaces: string[] = ['org.openehr', 'org.apperta']

const ADRootUrl = `https://tools.openehr.org/designer/api`

const formatADUrl = (repositoryId: string, listType: string) =>
`${ADRootUrl}/repository/entry/list?repositoryId=${repositoryId}&cache=false&type=${listType}&depth=-1`;

const formatGHSearchUrl = (repositoryId: string) => {
  return `https://api.github.com/repos/${repositoryId}/git/trees/master?recursive=1`;
};

const formatCKMSearchUrl = () => {
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



export const fetchADArchetype = async ( archetypeId: string,ADUsername: string, ADPassword: string, repositoryId: string) => {
    // 👇️ const data: GetUsersResponse
    const authString = `${ADUsername}:${ADPassword}`
    const authToken = `BASIC ${btoa(authString)}`
    const url = `${ADRootUrl}/repository/archetype/get?repositoryId=${repositoryId}&archetypeId=${archetypeId}`
    const { data, status } = await axios.get(url,
      {
        headers: {
          Accept: 'application/json',
          Authorization: authToken
        },
      },
    );
  return data

}

export const searchGHRepo = async (username: string, password: string, repoAccount: string, repoName: string, repoNamespace: string): Promise<ArchetypeList> => {

//  const token = btoa(username + ":" + password);

    try {
      const { data } = await axios.get(
        formatGHSearchUrl(`${repoAccount}/${repoName}`),
        {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        },
      );

      const files = data.tree.filter((file: { type: string; path: string; }) => file.type === 'blob' && file.path.endsWith('.adl'))
      return files.map( (file: { path: string; }) =>  {
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
  const url:string = formatCKMSearchUrl()
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

export const updateArchetypeList = async (repoAccount: string,repoName: string, repoNamespace: string, list: ArchetypeList) : Promise<ArchetypeList> => {

 // await readRemoteFileCache(repoAccount,repoName, repoNamespace,refreshCache)

  const upDatedList: ArchetypeList = [];

    list.forEach(localItem => {

    //  upDatedList.push({...item, provenance: 'local'})
      const match = archetypeList.find(remoteItem =>
      {
        const local: string = path.parse(remoteItem.archetypeId).name
        const remote: string = path.parse(localItem.archetypeId).name
        return local===remote
      })
    });

    return upDatedList
}

export const updateArchetypeLists = (remoteArchetypeList: ArchetypeList, candidateArchetypeList: ArchetypeList, localArchetypeList: ArchetypeList, provenance: ArchetypeProvenance) => {

  if (formalPublicationNamespaces.includes(provenance.custodianNamespace))
    remoteArchetypeList.push(provenance)
  else
  if (provenance.custodianNamespace.substring(0.5) === 'local')
    localArchetypeList.push(provenance)
 else
    candidateArchetypeList.push(provenance)

}

export const getProvenance = (templateNode: TemplateNode): ArchetypeProvenance  => {
  return {
    archetypeId: templateNode.nodeId,
    originalNamespace: templateNode.original_namespace,
    custodianNamespace: templateNode.custodian_namespace,
    semver: templateNode.revision,
    lifecycleStatus: templateNode.lifecycleState
  }
}


