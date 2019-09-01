import { Injectable } from '@angular/core';
import RsaPrivateKey from '@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey';
import { Authentication } from '@decentralized-identity/did-auth-jose';
import * as pemJwk from 'pem-jwk';
import {
  HubSession,
  HubWriteRequest,
  RsaCommitSigner,
  Commit,
  HubObjectQueryRequest,
  HubCommitQueryRequest,
  CommitStrategyBasic,
  HubObjectQueryResponse,
  SignedCommit,
  HubCommitQueryResponse
} from '@decentralized-identity/hub-sdk-js';
import { HttpResolver } from '@decentralized-identity/did-common-typescript';
import { Session } from 'inspector';
import { Router } from "@angular/router"
import { IHubObjectQueryOptions, IObjectMetadata, IHubCommitQueryOptions } from '@decentralized-identity/hub-common-js';
import { ITodoItem } from '../models/rule';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private HTTP_RESOLVER = 'https://beta.discover.did.microsoft.com/';
  private HUB_ENDPOINT = "https://beta.hub.microsoft.com/api/v1.0";
  private HUB_DID = "did:test:hub.id";

  private auth: Authentication;

  private USER_DID: string;
  private USER_KID: string;
  private USER_PEM: string;

  private hubSession: HubSession;
  private signer: RsaCommitSigner;
  private resolver: HttpResolver;

  constructor(private router: Router) { }

  public async login(DID: string, inputKid: string, pemKey: string) {

    this.USER_DID = DID;
    this.USER_KID = inputKid;
    this.USER_PEM = pemKey;

    const kid = `${this.USER_DID}#${this.USER_KID}`;
    const JWK = this.initializeJwk(kid);

    this.signer = new RsaCommitSigner({
      did: this.USER_DID,
      key: JWK
    });

    this.hubSession = new HubSession({
      hubEndpoint: this.HUB_ENDPOINT,
      hubDid: this.HUB_DID,
      resolver: new HttpResolver(this.HTTP_RESOLVER),
      clientDid: DID,
      targetDid: DID,
      clientPrivateKey: JWK
    });

    await this.hubSession.send(new HubObjectQueryRequest({
      interface: 'Collections',
      context: 'identity.foundation/schemas',
      type: 'ToDoItem'
    })).then(x => this.router.navigate(['/list']));

    // this.createAuthRequest(JWK, new HttpResolver(this.HTTP_RESOLVER))
    // .then(response=>{
    //   this.auth.verifyAuthenticationResponse(response).then(x=> console.log(x));
    // })
    // .catch(x=> console.log(x));


    // const keyStore: IKeyStore = new KeyStoreMem();
    // keyStore.save(kid, JWK);

    // const session = new HubSession({
    //   keyStore,
    //   hubEndpoint: this.HUB_ENDPOINT,
    //   hubDid: this.HUB_DID,
    //   resolver: new HttpResolver(this.HTTP_RESOLVER),
    //   clientDid: this.USER_DID,
    //   clientPrivateKeyReference: kid,
    //   targetDid: this.USER_DID,
    // });
  }



  public async shareTodos(granteeDid: string) {
    const request = {
      "@context": "https://identity.foundation/0.1",
      "@type": "PermissionGrant",
      "owner": this.USER_DID,
      "grantee": granteeDid,
      "context": "https://schema.org",
      "type": "ToDoItem",
      "allow": "CRUD",
    }

    // new HubWriteRequest({})

   const commit = await this.signer.sign(new Commit({
      protected: this.getStandardHeaders('create'),
      payload: request
    }));

    const commitRequest = new HubWriteRequest(commit);
    const commitResponse = await this.hubSession!.send(commitRequest);

    console.log(commitResponse);
    return commitResponse;


  }










  public async fetchTodos(): Promise<Array<ITodoItem>> {
    const objectIds = await this.fetchAllObjectIds();

    if (objectIds.length === 0) {
      console.log('No objects found.');
      return [];
    }

    const relevantCommits = await this.fetchAllCommitsRelatedToObjects(objectIds);

    // Group commits by object_id
    const commitsByObject = this.groupCommitsByObjectId(relevantCommits);

    const strategy = new CommitStrategyBasic();
    const resolvedTodos: Array<ITodoItem> = [];
    const commitsByObjectEntries = Object.entries(commitsByObject);

    // Iterate through each object and transform the commits into a final resolved state
    for (let i = 0; i < commitsByObjectEntries.length; i++) {
      let [objectId, commits] = commitsByObjectEntries[i];
      const resolvedObject = await strategy.resolveObject(commits);

      if (resolvedObject !== null) {
        resolvedTodos.push({
          object_id: objectId,
          text: resolvedObject.text,
          done: resolvedObject.done
        });
      }
    }

    console.log('Resolved current todos', resolvedTodos);

    return resolvedTodos;
  }

  /**
   * Retrieves metadata from the Hub for all ToDoItem objects.
   */
  private async fetchAllObjectIds() {
    const queryOptions: IHubObjectQueryOptions = {
      interface: 'Collections',
      context: 'identity.foundation/schemas',
      type: 'ToDoItem'
    };

    const objects: IObjectMetadata[] = [];
    let response: HubObjectQueryResponse | undefined = undefined;

    do {
      let skipTokenField: any = response && response.hasSkipToken()
        ? { skip_token: response.getSkipToken() }
        : {};
      const request = new HubObjectQueryRequest(Object.assign(queryOptions, skipTokenField));
      response = await this.hubSession!.send(request);
      objects.push(...response.getObjects());
      console.log(response);
      console.log(`Fetched ${response.getObjects().length} objects.`);
    } while (response.hasSkipToken());

    const objectIds = objects.map(o => o.id);
    console.log('Discovered object IDs', objectIds.map(id => id.substr(0, 8)));

    return objectIds;
  }

  /**
   * Retrieves all commits for each of the given object IDs.
   */
  private async fetchAllCommitsRelatedToObjects(objectIds: string[]) {
    const queryOptions: IHubCommitQueryOptions = {
      object_id: objectIds
    };

    const commits: SignedCommit[] = [];
    let response: HubCommitQueryResponse | undefined = undefined;

    do {
      let skipTokenField: any = response && response.hasSkipToken()
        ? { skip_token: response.getSkipToken() }
        : {};
      const request = new HubCommitQueryRequest(Object.assign(queryOptions, skipTokenField));
      response = await this.hubSession!.send(request);
      commits.push(...response.getCommits());
      console.log(response);
      console.log(`Fetched ${response.getCommits().length} commits.`);
    } while (response.hasSkipToken());

    console.log('Retrieved commits', commits);

    return commits;
  }

  /**
   * Given a flat list of commits, groups them based on the object ID.
   *
   * @param commits The commits to group.
   */
  private groupCommitsByObjectId(commits: SignedCommit[]) {
    let objects: { [id: string]: SignedCommit[] } = {};
    commits.forEach((commit) => {
      let commitObjectId = commit.getObjectId();
      let object = objects[commitObjectId];
      if (object) {
        object.push(commit);
      } else {
        objects[commitObjectId] = [commit];
      }
    });
    return objects;
  }

  /**
   * Commits a new to-do to the Hub.
   *
   * @param text The to-do text.
   */
  public async createTodo(text: string): Promise<string> {
    let response = await this.writeCommit(new Commit({
      protected: this.getStandardHeaders('create'),
      payload: {
        text,
        done: false
      }
    }));

    return response.getRevisions()[0];
  }

  /**
   * Commits an update to a to-do.
   *
   * @param object_id The object_id of the to-do.
   * @param text The current text.
   * @param done The current done state.
   */
  public async updateTodo(object_id: string, text: string, done: boolean) {
    return this.writeCommit(new Commit({
      protected: this.getStandardHeaders('update', object_id),
      payload: {
        text,
        done
      }
    }));
  }

  /**
   * Commits a deletion of a to-do.
   *
   * @param object_id The object_id of the to-do to delete.
   */
  public async deleteTodo(object_id: string) {
    return this.writeCommit(new Commit({
      protected: this.getStandardHeaders('delete', object_id),
      payload: {}
    }));
  }

  /**
   * Helper method to write a Commit to the Hub.
   */
  private async writeCommit(commit: Commit) {
    const signedCommit = await this.signer.sign(commit);

    const commitRequest = new HubWriteRequest(signedCommit);
    const commitResponse = await this.hubSession!.send(commitRequest);

    console.log(commitResponse);
    return commitResponse;
  }

  /**
   * Helper method to build the headers for a commit.
   */
  private getStandardHeaders(operation: 'create' | 'update' | 'delete', object_id?: string) {
    return Object.assign({
      committed_at: (new Date()).toISOString(),
      iss: this.USER_DID,
      sub: this.USER_DID,
      interface: 'Collections',
      context: 'identity.foundation/schemas',
      type: 'ToDoItem',
      operation,
      commit_strategy: 'basic'
    }, object_id ? { object_id } : {});
  }

































  public verifyLogin(response: string) {
    this.auth.verifyAuthenticationResponse(response).then(authResponse => console.log(authResponse));
  }



  private createAuthRequest(jwk: RsaPrivateKey, resolver: HttpResolver): Promise<string> {
    const keys = {};
    keys[jwk.kid] = jwk;
    this.auth = new Authentication({ keys: keys, resolver: resolver });

    return this.auth.signAuthenticationRequest({
      iss: this.USER_DID,
      response_type: 'id_token',
      client_id: 'http://localhost:4200/auth-response',
      scope: 'openid',
      state: undefined,
      nonce: 'sessionIdHere',
      claims: undefined
    });
  }

  private initializeJwk(kid: string): RsaPrivateKey {
    const jwk = pemJwk.pem2jwk(this.USER_PEM);
    jwk.kid = this.USER_KID;
    return RsaPrivateKey.wrapJwk(kid, jwk)
  }
}
