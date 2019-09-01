import { Component, OnInit } from '@angular/core';
import RsaPrivateKey from '@decentralized-identity/did-auth-jose/dist/lib/crypto/rsa/RsaPrivateKey';
import { Authentication } from '@decentralized-identity/did-auth-jose';
import * as pemJwk from 'pem-jwk';
import { HubSession } from '@decentralized-identity/hub-sdk-js';
import { HttpResolver } from '@decentralized-identity/did-common-typescript';
import { Session } from 'inspector';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private privateRsaPemKey: string = `-----BEGIN RSA PRIVATE KEY-----
  MIIEowIBAAKCAQEAp7qO9ruwVQ4r+4ufMEE9RosAOZ6C+fsyr5j00MtlicI8uR1I
  HSl9J/ao2ymf/Y7CjGsjIkxGLVCmYFKCQN335CsoqNHp51JbiNgHu3cD4byVU9en
  1Vm3R+H0PiMccRBpuqNhSneWiQ8LRmFVKOCGnrvmHr/tRvU8dtqPlCjjNMmUvZoe
  bhLUpL85O72vdk8TI7jTZGg/o31HmalCSTodUi+Hw7+8g/CovQZjnMISQgUx/+Of
  VvvpJFV3nqNTrozuxXPxyra7ej9lydp96Aozp1Ip4gjLF/8ec2O7HxQkU26FJ+Zm
  lgxcZ8oSn0YClp+NnMj7JgZOso47eBilwSJc9QIDAQABAoIBAGCdD3iECEAWF7Of
  aySqj5cwvgJykdNYpIuNOYeDgYtmfP/MJBvYKCV66SzEv0mYj+u+UtCQyuOTTyKw
  pCKlOQMO8S69K1R5lgwvE9Uh6vR+Yi2XTS+RrAcV2lBofRuLbrt5HLN+SxHLvpzd
  t+YB3slURmtz9kMnQ5rarlWTb7yZaZvDnyyl3CWN5ayqWGdbOR6/PnlQHutFAKiN
  7JvaN1T/GN8ejVbbGoBnCpIHEq8FGIaceOdQK8PBYXvDuQSVWubq8P7z/prMm/OP
  qmuU6JUKwoi/M3FYx+FJOnyBJtUdGSXiZ0+F9F9QZI3C74blFATbdbOlo6uP1fdl
  hvfj1gkCgYEA24StY4vSdPNh9ZwftT6tMUAiOeaJUEO3b8IKQHP+ZP4e2AwknjU2
  psq0W5Tn/Yly9RdHO20yRVsBo10n3FJYfAhGOA6mQjyc/pS6A0/DncCvM6UqNZyW
  NemXCjYRdt4GdKM/66aQV0gzzuQ51ujwhcygyPtpwXQiwRcl/M0tnKMCgYEAw5qD
  3mc6k7lhM9+GgZ4vH5LHKPvI7zcqfnc2RDYbim/TV5xuBMJOhp9RiViGyUiOf2Vi
  CEicvT6ZJAnkrpmPm6gMdM8BST/yBqNvyAfV0ocJOqcHN5URvqfSAl7xRGz1EBPW
  SAjMPs+5LSkyB4/Cg6SYslCeiVtP6+Dc+GwJYYcCgYEAq80D0mPMu2D7qricjEHY
  VDJIVx5ZGytUNjAby+O8FphX1WhzhCpLcnA0hXRduCzJfo3QXu8QJ/2Yo501pBYC
  UFg9dIPqlO5RRGFrz0mu5Bi4Regex8ScPudpIUG9m1UaolBdp3U9hEHq4iH2Ln8y
  NtU2hPVXCGN3C72tKlP+PZcCgYBVIvLUoZ+4Xo61UkwsLJqcJnmzF+w8WomPY/nl
  tJtGJSga0QZ94cjmBYAqxLJd98u2HX2O13QJVq63Jes4J7R+7qUFTnhj1oZUZ1ym
  9uoVaRsWQU793U9M6aSZzZM70iTUK54v2kxz5lvWEUEqU2M5gzHHIxnt9SWTKFtl
  cTigDwKBgFIfbcx9e26WfIPuCcRMtoQzLqOATngmPE7URcAJsC4xFg0EFccyEZAV
  pMWRXMceAXkyd8OZqyQp6Ft2F6FyxlABhTRB4941pVZZBzLQXFFA3VGMOgmia6+a
  Nb5skidaUZ1lGQ93YTYZkKhjXZ+sw4haf8i1YaMwwcCgyQOKPZTh
  -----END RSA PRIVATE KEY-----`;
  private inputKid: string = "testKey";
  private DID: string = "did:test:19ad3148-99ce-4248-a769-29ddc91ae429"; 


  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  login(){
    this.authService.login(this.DID, this.inputKid, this.privateRsaPemKey);
  }

  // login() {
  //   const kid = `${this.DID}#${this.inputKid}`;
  //   const JWK = this.initializeJwk(kid);



  //   const keyStore: IKeyStore = new KeyStoreMem();
  //   keyStore.save(kid, JWK);

  //   const session = new HubSession({
  //     keyStore,
  //     hubEndpoint: this.HUB_ENDPOINT,
  //     hubDid: this.HUB_DID,
  //     resolver: new HttpResolver(this.HTTP_RESOLVER),
  //     clientDid: this.DID,
  //     clientPrivateKeyReference: kid,
  //     targetDid: this.DID,
  //   });
  // }

  // createAuthRequest(jwk: RsaPrivateKey, resolver: HttpResolver) {
  //   const keys = {};
  //   keys[jwk.kid] = jwk;
  //   const auth = new Authentication({ keys: keys, resolver: resolver });

  //   auth.signAuthenticationRequest({
  //     iss: this.HUB_DID,
  //     response_type: 'id_token',
  //     client_id: 'http://localhost:4200/auth-response',
  //     scope: 'openid',
  //     state: undefined,
  //     nonce: 'sessionIdHere',
  //     claims: undefined
  //   }).then(val=> console.log('WTF', val));
  // }

  // initializeJwk(kid: string): RsaPrivateKey {
  //   const jwk = pemJwk.pem2jwk(this.privateRsaPemKey);
  //   jwk.kid = this.inputKid;
  //   return RsaPrivateKey.wrapJwk(kid, jwk)
  // }

}
