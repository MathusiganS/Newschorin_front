export interface Article {
  id: string;
  title: string;
  description: string;
  content: string[];
  category: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  isBreaking?: boolean;
}

export const articles: Article[] = [
  {
    id: "1",
    title: "Global Summit Reaches Historic Agreement on Climate Action",
    description:
      "World leaders unite in unprecedented commitment to combat climate change, setting ambitious targets for carbon emissions reduction by 2030.",
    content: [
      "In a landmark decision that could reshape the global approach to environmental policy, world leaders from over 190 countries have reached a historic agreement on climate action during the Global Climate Summit held in Geneva.",
      "The agreement, which took two weeks of intense negotiations to finalize, sets ambitious targets for reducing carbon emissions by 50% before 2030. This represents the most significant international commitment to combat climate change since the Paris Agreement of 2015.",
      '"This is a defining moment for our planet," said UN Secretary-General in a press conference following the announcement. "For the first time, we have a truly unified global response to the climate crisis that matches the urgency of the situation."',
      "Key provisions of the agreement include a $100 billion annual fund for developing nations to transition to clean energy, mandatory emissions reporting for all major industries, and a commitment to phase out coal power plants in developed nations by 2028.",
      "Environmental groups have largely praised the agreement, though some activists argue that the targets don't go far enough. \"While this is a step in the right direction, we need to see concrete action plans from each country within the next six months,\" said a spokesperson for Greenpeace International.",
    ],
    category: "WORLD",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168d3c?w=800&h=500&fit=crop",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    date: "2 hours ago",
    readTime: "8 min read",
    isBreaking: true,
  },
  {
    id: "2",
    title: "Revolutionary AI Model Breaks New Ground in Medical Research",
    description:
      "Scientists develop an AI system capable of predicting disease patterns with unprecedented accuracy, potentially saving millions of lives.",
    content: [
      "A team of researchers at Stanford University has unveiled a groundbreaking artificial intelligence model that promises to revolutionize the field of medical research and diagnostics.",
      "The AI system, named MedPredict, has demonstrated the ability to analyze complex medical data and predict disease patterns with an accuracy rate of 97.3%, far surpassing any existing diagnostic tools.",
      "During clinical trials involving over 50,000 patients, MedPredict successfully identified early signs of various cancers, cardiovascular diseases, and neurological conditions months before traditional diagnostic methods would have caught them.",
      '"This technology has the potential to save millions of lives by enabling early intervention," said Dr. Emily Chen, the lead researcher on the project. "We\'re essentially giving doctors a crystal ball that can peer into a patient\'s medical future."',
      "The system works by analyzing a combination of genetic data, medical history, lifestyle factors, and real-time biomarker readings to create comprehensive health profiles for each patient.",
    ],
    category: "TECH",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop",
    author: {
      name: "Michael Torres",
      avatar: "https://i.pravatar.cc/100?img=3",
    },
    date: "5 hours ago",
    readTime: "6 min read",
  },
  {
    id: "3",
    title: "Exploring the Future of Renewable Energy",
    description:
      "New solar technology promises to double energy output while cutting costs in half, marking a major breakthrough in clean energy.",
    content: [
      "The renewable energy sector is on the cusp of a major transformation, thanks to a series of technological breakthroughs that promise to make clean energy more efficient and affordable than ever before.",
      "At the forefront of this revolution is a new type of solar panel developed by researchers at MIT, which uses a novel perovskite-silicon tandem cell design to achieve energy conversion rates of over 40% — nearly double the efficiency of conventional solar panels.",
      '"We\'ve essentially cracked the code on next-generation solar technology," explained Professor James Liu, who led the research team. "These panels can generate twice the energy of traditional solar panels while costing significantly less to manufacture."',
      "The breakthrough comes at a critical time, as governments worldwide are ramping up their investments in renewable energy infrastructure. The International Energy Agency (IEA) projects that solar power could become the world's largest source of electricity by 2035 if current trends continue.",
      "Beyond solar, the wind energy sector is also seeing remarkable advances. New offshore wind turbines with 20-megawatt capacity are being deployed in the North Sea, capable of powering over 16,000 homes each.",
    ],
    category: "TECHNOLOGY",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=500&fit=crop",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    date: "October 26, 2023",
    readTime: "8 min read",
  },
  {
    id: "4",
    title: "Champions League Final: A Night to Remember",
    description:
      "In a thrilling match that went to extra time, the underdog team clinched victory in the Champions League final.",
    content: [
      "In what many are already calling the greatest Champions League final in history, AFC Roma pulled off a stunning upset against Manchester City, winning 3-2 in extra time at Wembley Stadium.",
      "The match had everything — drama, controversy, and moments of individual brilliance that will be replayed for decades to come.",
      "Roma's captain Marco Rossi scored a hat-trick, including a spectacular bicycle kick in the 118th minute that sealed the victory and sent the Italian club's fans into delirium.",
      '"I\'ve dreamed of this moment since I was a boy," said Rossi, tears streaming down his face as he lifted the trophy. "This is for everyone who believed in us when nobody else did."',
      "The result marks the first time Roma has won the Champions League in the club's history, and it cements Rossi's status as one of the greatest players of his generation.",
    ],
    category: "SPORTS",
    image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=500&fit=crop",
    author: {
      name: "David Park",
      avatar: "https://i.pravatar.cc/100?img=5",
    },
    date: "1 day ago",
    readTime: "5 min read",
  },
];
