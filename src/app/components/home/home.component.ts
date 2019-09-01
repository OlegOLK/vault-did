import { Component, OnInit } from '@angular/core';

import RsaPrivateKey from '@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey';
import { HttpResolver } from '@decentralized-identity/did-common-typescript';
import {
  HubSession,
  HubWriteRequest,
  RsaCommitSigner,
  Commit,
  HubObjectQueryRequest,
  HubCommitQueryRequest,
  CommitStrategyBasic
} from '@decentralized-identity/hub-sdk-js';

// Fill these in with specific values.
const HTTP_RESOLVER = 'https://beta.discover.did.microsoft.com/';
const HUB_ENDPOINT = "https://beta.hub.microsoft.com/api/v1.0";
const HUB_DID = "did:test:hub.id";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public async test() {
    try {
      const PRIVATE_KEY = {"kty":"RSA","n":"p7qO9ruwVQ4r-4ufMEE9RosAOZ6C-fsyr5j00MtlicI8uR1IHSl9J_ao2ymf_Y7CjGsjIkxGLVCmYFKCQN335CsoqNHp51JbiNgHu3cD4byVU9en1Vm3R-H0PiMccRBpuqNhSneWiQ8LRmFVKOCGnrvmHr_tRvU8dtqPlCjjNMmUvZoebhLUpL85O72vdk8TI7jTZGg_o31HmalCSTodUi-Hw7-8g_CovQZjnMISQgUx_-OfVvvpJFV3nqNTrozuxXPxyra7ej9lydp96Aozp1Ip4gjLF_8ec2O7HxQkU26FJ-ZmlgxcZ8oSn0YClp-NnMj7JgZOso47eBilwSJc9Q","e":"AQAB","d":"YJ0PeIQIQBYXs59rJKqPlzC-AnKR01iki405h4OBi2Z8_8wkG9goJXrpLMS_SZiP675S0JDK45NPIrCkIqU5Aw7xLr0rVHmWDC8T1SHq9H5iLZdNL5GsBxXaUGh9G4tuu3kcs35LEcu-nN235gHeyVRGa3P2QydDmtquVZNvvJlpm8OfLKXcJY3lrKpYZ1s5Hr8-eVAe60UAqI3sm9o3VP8Y3x6NVtsagGcKkgcSrwUYhpx451Arw8Fhe8O5BJVa5urw_vP-msyb84-qa5TolQrCiL8zcVjH4Uk6fIEm1R0ZJeJnT4X0X1BkjcLvhuUUBNt1s6Wjq4_V92WG9-PWCQ","p":"24StY4vSdPNh9ZwftT6tMUAiOeaJUEO3b8IKQHP-ZP4e2AwknjU2psq0W5Tn_Yly9RdHO20yRVsBo10n3FJYfAhGOA6mQjyc_pS6A0_DncCvM6UqNZyWNemXCjYRdt4GdKM_66aQV0gzzuQ51ujwhcygyPtpwXQiwRcl_M0tnKM","q":"w5qD3mc6k7lhM9-GgZ4vH5LHKPvI7zcqfnc2RDYbim_TV5xuBMJOhp9RiViGyUiOf2ViCEicvT6ZJAnkrpmPm6gMdM8BST_yBqNvyAfV0ocJOqcHN5URvqfSAl7xRGz1EBPWSAjMPs-5LSkyB4_Cg6SYslCeiVtP6-Dc-GwJYYc","dp":"q80D0mPMu2D7qricjEHYVDJIVx5ZGytUNjAby-O8FphX1WhzhCpLcnA0hXRduCzJfo3QXu8QJ_2Yo501pBYCUFg9dIPqlO5RRGFrz0mu5Bi4Regex8ScPudpIUG9m1UaolBdp3U9hEHq4iH2Ln8yNtU2hPVXCGN3C72tKlP-PZc","dq":"VSLy1KGfuF6OtVJMLCyanCZ5sxfsPFqJj2P55bSbRiUoGtEGfeHI5gWAKsSyXffLth19jtd0CVautyXrOCe0fu6lBU54Y9aGVGdcpvbqFWkbFkFO_d1PTOmkmc2TO9Ik1CueL9pMc-Zb1hFBKlNjOYMxxyMZ7fUlkyhbZXE4oA8","qi":"Uh9tzH17bpZ8g-4JxEy2hDMuo4BOeCY8TtRFwAmwLjEWDQQVxzIRkBWkxZFcxx4BeTJ3w5mrJCnoW3YXoXLGUAGFNEHj3jWlVlkHMtBcUUDdUYw6CaJrr5o1vmySJ1pRnWUZD3dhNhmQqGNdn6zDiFp_yLVhozDBwKDJA4o9lOE","kid":"testKey"};
      const DID = "did:test:7b3a6a21-8aca-4d43-a658-2372de3a2844";



      const kid = `${DID}#${PRIVATE_KEY.kid}`;
      const privateKey = RsaPrivateKey.wrapJwk(kid, PRIVATE_KEY);

      // const keyStore: IKeyStore = new KeyStoreMem();
      // keyStore.save(kid, privateKey);

      const session = new HubSession({
        hubEndpoint: HUB_ENDPOINT,
        hubDid: HUB_DID,
        resolver: new HttpResolver(HTTP_RESOLVER),
        clientDid: DID,
        targetDid: DID,
        clientPrivateKey: privateKey
      });

      await session.send(new HubObjectQueryRequest({
        interface: 'Collections',
        context: 'identity.foundation/schemas',
        type: 'ToDoItem'
      })).then(x=> console.log('AAAAA', x.getObjects().length));

      //
      // Write a new Commit to the Hub, creating a new object.
      //

      const commit = new Commit({
        protected: {
          committed_at: (new Date()).toISOString(),
          iss: DID,
          sub: DID,
          interface: 'Collections',
          context: 'http://schema.org',
          type: 'MusicPlaylist',
          operation: 'create',
          commit_strategy: 'basic',
        },
        payload: {
          title: 'My Playlist',
        },
      });

      const signer = new RsaCommitSigner({
        did: DID,
        key: privateKey,
      });

      const signedCommit = await signer.sign(commit);

      const commitRequest = new HubWriteRequest(signedCommit);
      const commitResponse = await session.send(commitRequest);
      console.log(commitResponse);

      //
      // Read available objects from the Hub.
      //

      const queryRequest = new HubObjectQueryRequest({
        interface: 'Collections',
        context: 'http://schema.org',
        type: 'MusicPlaylist',
      });

      const queryResponse = await session.send(queryRequest);
      console.log(queryResponse);

      const objects = queryResponse.getObjects();

      //
      // Read the contents of a single object.
      //

      if (objects.length > 0) {
        const objectMetadata = objects[0];

        if (objectMetadata.commit_strategy !== 'basic') {
          throw new Error('Currently only the basic commit strategy is supported.');
        }

        const commitQueryRequest = new HubCommitQueryRequest({
          object_id: [objectMetadata.id],
        });

        const commitQueryResponse = await session.send(commitQueryRequest);
        const commits = commitQueryResponse.getCommits();

        const strategy = new CommitStrategyBasic();
        const objectState = await strategy.resolveObject(commits);

        console.log(objectState);
      }

    } catch (e) {
      console.error(e);
    }
  }
}
