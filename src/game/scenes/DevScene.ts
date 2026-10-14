import Phaser from 'phaser';
import {mapsForCampaign} from '../data/campaign-expansion';
import type {CampaignId} from '../data/campaign-catalog';
export class DevScene extends Phaser.Scene {
 constructor(){super('Dev');}
 private campaignId:CampaignId='awakening-ten';
 init(data:{campaignId?:CampaignId}={}):void {this.campaignId=data.campaignId??'awakening-ten';}
 create():void {
  this.add.rectangle(448,288,896,576,0x061420,.94).setInteractive();
  this.add.rectangle(448,288,650,444,0xe9d9b0).setStrokeStyle(3,0x96763a);
  this.add.text(160,88,'Developer menu',{fontFamily:'serif',fontSize:'28px',color:'#253d50'});
  this.add.text(160,134,'Map jumps create a fresh test party. Your campaign save is preserved.',{fontSize:'14px',color:'#443722',wordWrap:{width:570}});
  const button=(y:number,label:string,action:()=>void,x=170)=>this.add.text(x,y,label,{fontFamily:'serif',fontSize:'20px',color:'#253d50',backgroundColor:'#f4e9ca',padding:{x:12,y:6}}).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.game.events.emit('ux-feedback',{kind:'confirm'});action();});
  mapsForCampaign(this.campaignId).forEach((map,i)=>button(182+(i%5)*39,`${i+1}. ${map.name}`,()=>this.game.events.emit('dev-jump',i,this.campaignId),i<5?150:470));
  button(392,'Resume saved campaign',()=>this.game.events.emit('campaign-resume'));
  button(451,'Close · Escape / F9',()=>this.game.events.emit('dev-close'));
  this.input.keyboard?.on('keydown', (event:KeyboardEvent)=>{if(event.code==='Escape'||event.code==='F9'||event.code==='Backquote'){event.preventDefault();this.game.events.emit('dev-close');}else if(/^Digit[0-9]$/.test(event.code))this.game.events.emit('dev-jump',event.code==='Digit0'?9:Number(event.code.slice(-1))-1,this.campaignId);});
  this.events.once('shutdown',()=>this.input.keyboard?.removeAllListeners());
 }
}
