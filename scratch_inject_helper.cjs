const fs = require('fs');
const path = 'c:/Users/whilmis/Documents/GitHub/Hormesis-back/src/services/execution.engine.ts';

let content = fs.readFileSync(path, 'utf8');

// Define category images helper
const categoryImagesHelper = `
function getCategoryImages(businessName: string, niche: string, website: string) {
  const combined = (businessName + ' ' + niche + ' ' + website).toLowerCase();
  
  if (combined.includes('gestor') || combined.includes('asesor') || combined.includes('abogad') || combined.includes('legal') || combined.includes('fiscal') || combined.includes('transferencia')) {
    return {
      hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      service1: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      service2: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      service3: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80',
      avatar1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    };
  } else if (combined.includes('idioma') || combined.includes('ingles') || combined.includes('school') || combined.includes('academ') || combined.includes('educa')) {
    return {
      hero: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      service1: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
      service2: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
      service3: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
      avatar1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      avatar2: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    };
  } else if (combined.includes('dental') || combined.includes('clinic') || combined.includes('salud') || combined.includes('medic') || combined.includes('fisio')) {
    return {
      hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
      service1: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
      service2: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80',
      service3: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      avatar1: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      avatar2: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
    };
  } else {
    return {
      hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      service1: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      service2: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
      service3: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80',
      avatar1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    };
  }
}
`;

// Insert helper before class GoogleStitchWorkflow if not present
if (!content.includes('function getCategoryImages')) {
  content = content.replace('class GoogleStitchWorkflow', categoryImagesHelper + '\nclass GoogleStitchWorkflow');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Category helper injected successfully');
