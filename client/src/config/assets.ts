
// Define path to assets folder
export const ASSET_BASE_PATH = "/attached_assets";

// Video assets for the video showcase
export const VIDEOS = [
  {
    id: "dp-video-1",
    src: `${ASSET_BASE_PATH}/a7ee9924_5f50_4857_826b_582d7ccc72da.mp4`,
    title: "Advanced Multi-Stage AI Thought Pipeline",
    description: "Visualizing the architecture of our multi-model neural processing system",
    category: "thought",
    thumbnail: `${ASSET_BASE_PATH}/IMG_7909.png`,
  },
  {
    id: "dp-video-2",
    src: `${ASSET_BASE_PATH}/4a3cc005_49dc_484c_97b8_b525aea7c66f.mp4`,
    title: "Neural Pathway Integration",
    description: "Immersive visualization of the parallel thought processing streams",
    category: "neural",
    thumbnail: `${ASSET_BASE_PATH}/IMG_7911.png`,
  }
];

// Create mappings for common assets
export const IMAGES = {
  // Brand images
  logo: "/brand/logo.svg",
  
  // Hero section images
  hero: {
    main: `${ASSET_BASE_PATH}/IMG_7925.png`,
    portal: `${ASSET_BASE_PATH}/IMG_7914.jpeg`,
    secondary: `${ASSET_BASE_PATH}/IMG_7929.jpeg`, // Cognitive gateway
  },
  
  // Component background images
  backgrounds: {
    thoughtProcessor: `${ASSET_BASE_PATH}/IMG_7910.png`, // Cognitive architecture
    pipeline: `${ASSET_BASE_PATH}/IMG_7913.png`, // Thought integration process
    gallery: `${ASSET_BASE_PATH}/IMG_7920.jpeg`, // Adaptive reasoning framework
    storyboard: `${ASSET_BASE_PATH}/IMG_7927.jpeg`, // Pattern recognition system
    dashboard: `${ASSET_BASE_PATH}/IMG_7916.jpeg`, // Data transformation flow
    projectSection: `${ASSET_BASE_PATH}/IMG_7912.png`, // Abstraction hierarchy
    login: `${ASSET_BASE_PATH}/IMG_7926.jpeg`, // Information integration
    admin: `${ASSET_BASE_PATH}/IMG_7928.jpeg`, // Decision matrix visualization
  },
  
  // Category-specific collections
  categories: {
    // Thought visualization images
    thought: [
      { 
        src: `${ASSET_BASE_PATH}/IMG_7909.png`,
        alt: "Neural flow visualization",
        description: "Deep parallel thought patterns"
      },
      { 
        src: `${ASSET_BASE_PATH}/IMG_7911.png`,
        alt: "Multi-dimensional reasoning",
        description: "Parallelized conceptual frameworks"
      },
      {
        src: `${ASSET_BASE_PATH}/IMG_7907.jpeg`,
        alt: "Thought wave patterns",
        description: "Neural current visualization system"
      },
      {
        src: `${ASSET_BASE_PATH}/IMG_7917.jpeg`,
        alt: "Cognitive processing layers",
        description: "Multi-stage thought synthesis"
      },
      {
        src: `${ASSET_BASE_PATH}/IMG_7930.jpeg`,
        alt: "Integrated intelligence system",
        description: "Comprehensive AI framework"
      }
    ],
    
    // Urban visualization images
    urban: [
      {
        src: `${ASSET_BASE_PATH}/IMG_7886.png`,
        alt: "Smart city data overlay",
        description: "Real-time urban infrastructure analysis"
      },
      {
        src: `${ASSET_BASE_PATH}/IMG_7884.png`,
        alt: "Urban data architecture",
        description: "Advanced city pattern recognition system"
      },
      {
        src: `${ASSET_BASE_PATH}/IMG_7887.png`,
        alt: "Data flow in urban environments",
        description: "City infrastructure intelligence mapping"
      },
      { 
        src: `${ASSET_BASE_PATH}/IMG_7922.jpeg`,
        alt: "Urban pattern recognition",
        description: "Spatial reasoning synthesis"
      },
      { 
        src: `${ASSET_BASE_PATH}/IMG_7923.jpeg`,
        alt: "Contextual understanding",
        description: "Multi-level urban analysis"
      }
    ],
    
    // Data visualization images
    data: [
      { 
        src: `${ASSET_BASE_PATH}/IMG_7919.png`,
        alt: "Information flow structures",
        description: "Thought pattern organization"
      },
      {
        src: `${ASSET_BASE_PATH}/IMG_7915.jpeg`,
        alt: "Knowledge representation",
        description: "Dynamic information architecture"
      },
      {
        src: `${ASSET_BASE_PATH}/IMG_7921.jpeg`,
        alt: "Memory architecture",
        description: "Information retention system"
      },
      { 
        src: `${ASSET_BASE_PATH}/IMG_7924.jpeg`,
        alt: "Information flow topology",
        description: "Structured data pathways"
      },
      {
        src: `${ASSET_BASE_PATH}/IMG_7912.jpeg`,
        alt: "Information patterns",
        description: "Abstract data representation"
      }
    ]
  },
  
  // Featured images for special sections
  featured: {
    thoughtAnalysis: `${ASSET_BASE_PATH}/IMG_7909.png`, // Neural flow visualization
    urbanInsights: `${ASSET_BASE_PATH}/IMG_7886.png`, // Smart city data overlay
    dataPatterns: `${ASSET_BASE_PATH}/IMG_7919.png`, // Information flow structures
    cognitivePortal: `${ASSET_BASE_PATH}/IMG_7925.png`, // Immersive thought portal
    neuralGateway: `${ASSET_BASE_PATH}/IMG_7914.jpeg`, // Neural portal gateway
  },
  
  // Curated showcase selection (reduced duplicates)
  showcase: [
    // Thought category
    { 
      src: `${ASSET_BASE_PATH}/IMG_7909.png`,
      alt: "Neural flow visualization",
      description: "Deep parallel thought patterns",
      category: "thought"
    },
    { 
      src: `${ASSET_BASE_PATH}/IMG_7911.png`,
      alt: "Multi-dimensional reasoning",
      description: "Parallelized conceptual frameworks",
      category: "thought"
    },
    {
      src: `${ASSET_BASE_PATH}/IMG_7907.jpeg`,
      alt: "Thought wave patterns",
      description: "Neural current visualization system",
      category: "thought"
    },
    {
      src: `${ASSET_BASE_PATH}/IMG_7917.jpeg`,
      alt: "Cognitive processing layers",
      description: "Multi-stage thought synthesis",
      category: "thought"
    },
    {
      src: `${ASSET_BASE_PATH}/IMG_7929.jpeg`,
      alt: "Cognitive gateway",
      description: "Neural transit visualization",
      category: "thought"
    },
    
    // Urban category
    {
      src: `${ASSET_BASE_PATH}/IMG_7886.png`,
      alt: "Smart city data overlay",
      description: "Real-time urban infrastructure analysis",
      category: "urban"
    },
    {
      src: `${ASSET_BASE_PATH}/IMG_7884.png`,
      alt: "Urban data architecture",
      description: "Advanced city pattern recognition system",
      category: "urban"
    },
    {
      src: `${ASSET_BASE_PATH}/IMG_7887.png`,
      alt: "Data flow in urban environments",
      description: "City infrastructure intelligence mapping",
      category: "urban"
    },
    { 
      src: `${ASSET_BASE_PATH}/IMG_7922.jpeg`,
      alt: "Urban pattern recognition",
      description: "Spatial reasoning synthesis",
      category: "urban"
    },
    
    // Data category
    { 
      src: `${ASSET_BASE_PATH}/IMG_7919.png`,
      alt: "Information flow structures",
      description: "Thought pattern organization",
      category: "data"
    },
    {
      src: `${ASSET_BASE_PATH}/IMG_7915.jpeg`,
      alt: "Knowledge representation",
      description: "Dynamic information architecture",
      category: "data"
    },
    {
      src: `${ASSET_BASE_PATH}/IMG_7921.jpeg`,
      alt: "Memory architecture",
      description: "Information retention system",
      category: "data"
    },
    { 
      src: `${ASSET_BASE_PATH}/IMG_7924.jpeg`,
      alt: "Information flow topology",
      description: "Structured data pathways",
      category: "data"
    },
    {
      src: `${ASSET_BASE_PATH}/IMG_7912.jpeg`,
      alt: "Information patterns",
      description: "Abstract data representation",
      category: "data"
    }
  ]
};
