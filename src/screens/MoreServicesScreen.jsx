import { BookOpen, ChevronRight, ClipboardList, History, Lightbulb, Store, UsersRound } from 'lucide-react';
import { ScreenTitle } from '../components/UI.jsx';

const groups = [
  { title:'Contribute to Masinloc', items:[
    ['submit-history','Submit Masinloc History','Share a local story, record or source.',History],
    ['submit-word','Submit a Sambal Tina Word','Contribute a word for source checking.',BookOpen],
    ['my-submissions','My Submissions','Review contributions saved on this device.',ClipboardList],
    ['suggest-correction','Suggest a Correction / Update','Flag information that needs review.',Lightbulb],
  ]},
  { title:'Business & community', items:[
    ['sellers','For Sellers','List your business and access Masinloc POS.',Store],
    ['about','About Masinloc Connect','Learn how the app and public website work together.',UsersRound],
  ]},
];

export default function MoreServicesScreen({ navigate }) {
  return <div className="screen-stack mobile-native-stack"><ScreenTitle title="More Services" subtitle="Contribute history, words and community knowledge." />
    {groups.map((group)=><section className="native-section" key={group.title}><div className="native-section-title"><h2>{group.title}</h2></div><div className="native-action-list">{group.items.map(([id,title,body,Icon])=><button key={id} type="button" onClick={()=>navigate(id)}><span className="native-action-icon"><Icon size={21}/></span><div><strong>{title}</strong><span>{body}</span></div><ChevronRight size={18}/></button>)}</div></section>)}
  </div>;
}
