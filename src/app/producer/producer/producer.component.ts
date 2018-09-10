import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, share } from 'rxjs/operators';
import { EosService } from '../../services/eos.service';
// import { AccountService } from '../../services/account.service';
// import { BpService } from '../../services/bp.service';
import { Producer } from '../../models/Producer';

@Component({
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss']
})
export class ProducerComponent implements OnInit {

  name$: Observable<string>;
  producer$: Observable<Producer>;

  constructor(
    private route: ActivatedRoute,
    private eosService: EosService
    // private accountService: AccountService,
    // private bpService: BpService
  ) { }

  ngOnInit() {
    this.name$ = this.route.params.pipe(
      map(params => params.id)
    );
    this.producer$ = combineLatest(
      this.name$,
      this.eosService.getChainStatus(),
      this.eosService.getProducers(),
      this.name$.pipe(
        switchMap(name => this.eosService.getAccount(name).pipe(
          map(accountRaw => ({ name: name, raw: accountRaw }))
        ))
      )
    ).pipe(
      map(([name, chainStatus, producers, account]) => {
        const producer = producers.find(producer => producer.owner === name);
        const index = producers.findIndex(producer => producer.owner === name);
        const votesToRemove = producers.reduce((acc, cur) => {
          const percentageVotes_ = cur.total_votes_weight / chainStatus.total_producer_vote_weight * 100;
          if (percentageVotes_ * 200 < 100) {
            acc += parseFloat(cur.total_votes_weight);
          }
          return acc;
        }, 0);
        const position = parseInt(index, 10) + 1;
        const percentageVotes = producer.total_votes_weight / chainStatus.total_producer_vote_weight * 100;
        return {
          ...producer,
          account: account,
          position: position,
          votes: percentageVotes.toFixed(2),
          totalVotes: producer.total_votes.toFixed(0),
          totalVotesWeight: producer.total_votes_weight.toFixed(2)
        };
      }),
      // switchMap(producer => {
      //   if (!producer.url) {
      //     return of(producer);
      //   } else {
      //     return this.bpService.getBP(producer.url).pipe(
      //       map(bpJson => ({
      //         ...producer,
      //         bpJson,
      //         location: bpJson && bpJson.nodes && bpJson.nodes[0] && bpJson.nodes[0].location,
      //         validated: bpJson && bpJson.producer_public_key === producer.producer_key && bpJson.producer_account_name === producer.owner
      //       }))
      //     );
      //   }
      // }),
      share()
    );
  }

  // ngOnInit() {
  //   this.name$ = this.route.params.pipe(
  //     map(params => params.id)
  //   );
  //   this.producer$ = combineLatest(
  //     this.name$,
  //     this.eosService.getChainStatus(),
  //     this.eosService.getProducers(),
  //     this.name$.pipe(
  //       switchMap(name => this.accountService.getAccount(name)),
  //       switchMap(account => this.eosService.getAccount(account.name).pipe(
  //         map(accountRaw => ({ ...account, raw: accountRaw }))
  //       ))
  //     )
  //   ).pipe(
  //     map(([name, chainStatus, producers, account]) => {
  //       const producer = producers.find(producer => producer.owner === name);
  //       const index = producers.findIndex(producer => producer.owner === name);
  //       const votesToRemove = producers.reduce((acc, cur) => {
  //         const percentageVotes_ = cur.total_votes_weight / chainStatus.total_producer_vote_weight * 100;
  //         if (percentageVotes_ * 200 < 100) {
  //           acc += parseFloat(cur.total_votes_weight);
  //         }
  //         return acc;
  //       }, 0);
  //       const position = parseInt(index, 10) + 1;
  //       let reward = 0;
  //       const percentageVotes = producer.total_votes_weight / chainStatus.total_producer_vote_weight * 100;
  //       const percentageVotesRewarded = producer.total_votes_weight / (chainStatus.total_producer_vote_weight - votesToRemove) * 100;
  //       if (position < 22) {
  //         reward += 318;
  //       }
  //       reward += percentageVotesRewarded * 200;
  //       if (percentageVotes * 200 < 100) {
  //         reward = 0;
  //       }
  //       return {
  //         ...producer,
  //         account: account,
  //         position: position,
  //         reward: reward.toFixed(0),
  //         votes: percentageVotes.toFixed(2)
  //       };
  //     }),
  //     switchMap(producer => {
  //       if (!producer.url) {
  //         return of(producer);
  //       } else {
  //         return this.bpService.getBP(producer.url).pipe(
  //           map(bpJson => ({
  //             ...producer,
  //             bpJson,
  //             location: bpJson && bpJson.nodes && bpJson.nodes[0] && bpJson.nodes[0].location,
  //             validated: bpJson && bpJson.producer_public_key === producer.producer_key && bpJson.producer_account_name === producer.owner
  //           }))
  //         );
  //       }
  //     }),
  //     share()
  //   );
  // }

}
