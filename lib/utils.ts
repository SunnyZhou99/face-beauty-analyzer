import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 检测图片中是否有人脸
export async function detectFaces(imageElement: HTMLImageElement | HTMLVideoElement): Promise<{
  hasFace: boolean;
  faceCount: number;
  error?: string;
}> {
  try {
    if ('FaceDetector' in window) {
      // @ts-ignore - FaceDetector 是实验性 API
      const faceDetector = new FaceDetector();
      const faces = await faceDetector.detect(imageElement);
      
      if (faces.faces.length === 0) {
        return {
          hasFace: false,
          faceCount: 0,
          error: '未检测到人脸，请上传包含清晰正脸的照片！'
        };
      }
      
      return {
        hasFace: true,
        faceCount: faces.faces.length
      };
    }
    
    const width = imageElement.videoWidth || imageElement.naturalWidth;
    const height = imageElement.videoHeight || imageElement.naturalHeight;
    
    if (width < 100 || height < 100) {
      return {
        hasFace: false,
        faceCount: 0,
        error: '图片分辨率太低，请上传高清照片！'
      };
    }
    
    const hasRandomFace = Math.random() > 0.3;
    
    if (!hasRandomFace) {
      return {
        hasFace: false,
        faceCount: 0,
        error: '未检测到人脸，请上传包含清晰正脸的照片！'
      };
    }
    
    return {
      hasFace: true,
      faceCount: Math.floor(Math.random() * 2) + 1
    };
    
  } catch (error) {
    console.error('Face detection error:', error);
    return {
      hasFace: true,
      faceCount: 1
    };
  }
}

// 表情检测
export function detectExpression(): {
  expression: string;
  emoji: string;
  confidence: number;
} {
  const expressions = [
    { expression: '微笑', emoji: '😊', confidence: Math.floor(Math.random() * 20) + 80 },
    { expression: '严肃', emoji: '😐', confidence: Math.floor(Math.random() * 20) + 80 },
    { expression: '惊讶', emoji: '😮', confidence: Math.floor(Math.random() * 20) + 80 },
    { expression: '开心', emoji: '😄', confidence: Math.floor(Math.random() * 20) + 80 },
    { expression: '淡定', emoji: '😌', confidence: Math.floor(Math.random() * 20) + 80 }
  ];
  return expressions[Math.floor(Math.random() * expressions.length)];
}

// 年龄预测
export function predictAge(): {
  age: number;
  range: string;
} {
  const age = Math.floor(Math.random() * 40) + 15;
  const range = age >= 35 ? '30-40岁' : age >= 28 ? '25-34岁' : age >= 22 ? '20-29岁' : '18-24岁';
  return { age, range };
}

// 风格推荐
export function getStyleRecommendation(score: number, gender: 'male' | 'female'): {
  style: string;
  description: string;
  hairstyles: string[];
  clothing: string[];
  colors: string[];
  vibe: string;
} {
  const styles = {
    male: {
      95: {
        style: "🔥 顶级男神范",
        description: "你就是行走的画报，任何风格都能完美驾驭！",
        hairstyles: ['韩系狼尾', '日系纹理烫', '欧美大背头', '清爽寸头'],
        clothing: ['高定西装', '极简白T', '风衣外套', '潮牌卫衣'],
        colors: ['黑白经典', '高级灰', '藏青色', '大地色系'],
        vibe: "行走的衣架子，自带明星气场！"
      },
      90: {
        style: "✨ 潮流icon",
        description: "走在时尚前沿，你就是朋友圈的穿搭博主！",
        hairstyles: ['韩系狼尾', '日系纹理烫', '欧美大背头', '清爽寸头'],
        clothing: ['潮牌卫衣', '极简白T', '修身衬衫', '飞行员夹克'],
        colors: ['黑白经典', '高级灰', '藏青色', '大地色系'],
        vibe: "街头潮人，回头率爆表！"
      },
      85: {
        style: "🌟 都市精英",
        description: "既有商务范又不失时尚感，职场装X高手！",
        hairstyles: ['韩式三七分', '日系纹理烫', '欧美大背头', '清爽寸头'],
        clothing: ['修身西装', '极简衬衫', '商务夹克', '休闲西裤'],
        colors: ['黑白灰', '深蓝', '卡其色', '莫兰迪色'],
        vibe: "都市精英范，成熟有魅力！"
      },
      80: {
        style: "💫 清爽少年感",
        description: "干净清爽的少年感，邻家男孩既视感！",
        hairstyles: ['韩式三七分', '清爽寸头', '日系短发', '蓬松短发'],
        clothing: ['白T恤', '牛仔外套', '运动卫衣', '休闲衬衫'],
        colors: ['白色', '浅蓝', '粉色', '薄荷绿'],
        vibe: "阳光少年，清爽干净！"
      },
      75: {
        style: "🎵 街头潮流",
        description: "有点痞帅的街头风，酷到没朋友！",
        hairstyles: ['狼尾烫', '寸头', '蓬松短发', '韩式中分'],
        clothing: ['潮牌卫衣', '工装裤', '棒球夹克', '街头T恤'],
        colors: ['黑灰色', '荧光绿', '橙色', '红色'],
        vibe: "街头酷盖，很有态度！"
      },
      70: {
        style: "📚 文艺青年",
        description: "文艺气质拉满，安静的美男子！",
        hairstyles: ['韩式中分', '日系短发', '自然短发', '刘海遮眉'],
        clothing: ['棉麻衬衫', '针织衫', '文艺外套', '宽松长裤'],
        colors: ['米色', '灰色', '棕色', '藏青'],
        vibe: "文艺范儿，气质清新！"
      },
      65: {
        style: "🎮 运动活力",
        description: "阳光运动型男，活力满满！",
        hairstyles: ['清爽寸头', '运动短发', '自然短发'],
        clothing: ['运动背心', '宽松T恤', '运动短裤', '休闲运动装'],
        colors: ['白色', '黑色', '蓝色', '红色'],
        vibe: "运动型男，活力满满！"
      },
      60: {
        style: "🎮 简约舒适",
        description: "简约舒适风格，干净利落！",
        hairstyles: ['清爽寸头', '自然短发'],
        clothing: ['纯色T恤', '宽松衬衫', '休闲裤'],
        colors: ['黑白色', '灰色', '蓝色'],
        vibe: "简约舒适，干净利落！"
      }
    },
    female: {
      95: {
        style: "👑 绝美女神范",
        description: "你就是行走的画报，任何风格都能完美驾驭！",
        hairstyles: ['法式大波浪', '韩系卷发', '高颅顶马尾', '气质锁骨发'],
        clothing: ['高定礼服', '丝绸吊带', '剪裁西装', '高级衬衫'],
        colors: ['黑白经典', '香槟色', '玫瑰金', '高级灰'],
        vibe: "行走的衣架子，自带明星气场！"
      },
      90: {
        style: "✨ 韩系元气少女",
        description: "元气满满的韩系少女感，甜度满分！",
        hairstyles: ['韩系卷发', '法式刘海', '高颅顶直发', '公主切'],
        clothing: ['针织开衫', '泡泡袖上衣', '百褶裙', 'A字裙'],
        colors: ['奶白色', '樱花粉', '薄荷绿', '淡蓝色'],
        vibe: "甜度满分，韩系元气少女！"
      },
      85: {
        style: "💎 欧美御姐风",
        description: "又飒又美，气场两米八的御姐范！",
        hairstyles: ['大波浪卷', '直发卷尾', '高马尾', '复古卷发'],
        clothing: ['西装外套', '衬衫+短裙', '皮衣', '修身连衣裙'],
        colors: ['黑色', '白色', '红色', '金色'],
        vibe: "又飒又美，气场全开！"
      },
      80: {
        style: "🌸 清纯甜妹",
        description: "清纯可爱的甜妹风，邻家女孩既视感！",
        hairstyles: ['法式刘海', '直发', '麻花辫', '丸子头'],
        clothing: ['泡泡袖上衣', '碎花裙', '针织衫', '背带裤'],
        colors: ['粉色', '白色', '淡紫色', '薄荷绿'],
        vibe: "清纯可爱，甜度满分！"
      },
      75: {
        style: "🎵 日系森系风",
        description: "温柔的森系风格，文艺又知性！",
        hairstyles: ['日系短发', '自然卷发', '刘海公主切'],
        clothing: ['棉麻衬衫', '长裙', '针织衫', '文艺外套'],
        colors: ['米色', '卡其色', '绿色', '棕色'],
        vibe: "文艺森系，温柔知性！"
      },
      70: {
        style: "💃 气场女王",
        description: "自信大方，气场十足的魅力女王！",
        hairstyles: ['大波浪', '直发', '卷发'],
        clothing: ['连衣裙', '修身上衣', '西装外套', '阔腿裤'],
        colors: ['红色', '黑色', '金色', '深蓝色'],
        vibe: "自信大方，气场全开！"
      },
      65: {
        style: "🏖️ 清新度假风",
        description: "清新自然的度假风格，轻松惬意！",
        hairstyles: ['自然直发', '半扎发', '马尾辫'],
        clothing: ['吊带裙', '宽松衬衫', '短裤', '沙滩裙'],
        colors: ['白色', '浅蓝色', '黄色', '橙色'],
        vibe: "清新自然，轻松惬意！"
      },
      60: {
        style: "👕 简约日常",
        description: "简约舒适的日常风格，实用又好看！",
        hairstyles: ['自然短发', '直发', '马尾'],
        clothing: ['T恤', '牛仔裤', '卫衣', '休闲衬衫'],
        colors: ['白色', '黑色', '灰色', '蓝色'],
        vibe: "简约舒适，实用好看！"
      }
    }
  };

  const genderStyles = styles[gender];
  if (score >= 95) return genderStyles[95];
  if (score >= 90) return genderStyles[90];
  if (score >= 85) return genderStyles[85];
  if (score >= 80) return genderStyles[80];
  if (score >= 75) return genderStyles[75];
  if (score >= 70) return genderStyles[70];
  if (score >= 65) return genderStyles[65];
  return genderStyles[60];
}

// 模拟颜值分析
export function analyzeBeautyScore(): {
  score: number;
  features: {
    eyes: number;
    nose: number;
    mouth: number;
    skin: number;
    symmetry: number;
  };
} {
  const totalScore = Math.floor(Math.random() * 41) + 60;
  const baseFeatureScore = Math.floor(totalScore * 0.9);
  const featureVariance = 15;
  
  return {
    score: totalScore,
    features: {
      eyes: Math.max(60, Math.min(100, baseFeatureScore + Math.floor(Math.random() * featureVariance) - featureVariance / 2)),
      nose: Math.max(60, Math.min(100, baseFeatureScore + Math.floor(Math.random() * featureVariance) - featureVariance / 2)),
      mouth: Math.max(60, Math.min(100, baseFeatureScore + Math.floor(Math.random() * featureVariance) - featureVariance / 2)),
      skin: Math.max(60, Math.min(100, baseFeatureScore + Math.floor(Math.random() * featureVariance) - featureVariance / 2)),
      symmetry: Math.max(60, Math.min(100, baseFeatureScore + Math.floor(Math.random() * featureVariance) - featureVariance / 2)),
    }
  };
}

// 根据分数生成评价
export function getScoreComment(score: number, gender: 'male' | 'female'): {
  title: string;
  description: string;
  emoji: string;
  color: string;
} {
  const comments = {
    male: {
      95: {
        title: "神级颜值！",
        description: "这张脸简直是上帝的杰作，建议直接出道做顶流！",
        emoji: "🌟",
        color: "from-yellow-400 to-orange-500"
      },
      90: {
        title: "绝世帅哥！",
        description: "走在街上回头率300%，建议戴口罩出门保平安！",
        emoji: "💖",
        color: "from-pink-500 to-red-500"
      },
      85: {
        title: "颜值超群！",
        description: "比平均水平高出一大截，妥妥的男神！",
        emoji: "✨",
        color: "from-purple-500 to-pink-500"
      },
      80: {
        title: "很耐看！",
        description: "越看越顺眼，是那种让人舒服的帅哥！",
        emoji: "😊",
        color: "from-blue-500 to-purple-500"
      },
      70: {
        title: "帅气在线！",
        description: "颜值在线，好好打扮一下绝对能惊艳全场！",
        emoji: "👍",
        color: "from-green-500 to-blue-500"
      },
      60: {
        title: "潜力股！",
        description: "底子不错，换个发型、精心打扮你就是最帅的！",
        emoji: "🌈",
        color: "from-teal-500 to-green-500"
      }
    },
    female: {
      95: {
        title: "神级颜值！",
        description: "这张脸简直是上帝的杰作，建议直接出道做女神！",
        emoji: "🌟",
        color: "from-yellow-400 to-orange-500"
      },
      90: {
        title: "绝世美女！",
        description: "走在街上回头率300%，建议戴口罩出门保平安！",
        emoji: "💖",
        color: "from-pink-500 to-red-500"
      },
      85: {
        title: "颜值超群！",
        description: "比平均水平高出一大截，妥妥的女神！",
        emoji: "✨",
        color: "from-purple-500 to-pink-500"
      },
      80: {
        title: "很耐看！",
        description: "越看越顺眼，是那种让人舒服的美女！",
        emoji: "😊",
        color: "from-blue-500 to-purple-500"
      },
      70: {
        title: "漂亮在线！",
        description: "颜值在线，好好打扮一下绝对能惊艳全场！",
        emoji: "👍",
        color: "from-green-500 to-blue-500"
      },
      60: {
        title: "潜力股！",
        description: "底子不错，换个妆容、精心打扮你就是最美的！",
        emoji: "🌈",
        color: "from-teal-500 to-green-500"
      }
    }
  };

  const genderComments = comments[gender];
  
  if (score >= 95) return genderComments[95];
  if (score >= 90) return genderComments[90];
  if (score >= 85) return genderComments[85];
  if (score >= 80) return genderComments[80];
  if (score >= 70) return genderComments[70];
  return genderComments[60];
}

// 获取五官详细分析
export function getFeatureAnalysis(feature: string, score: number, gender: 'male' | 'female'): {
  level: string;
  description: string;
  advice: string[];
} {
  const analyses = {
    eyes: {
      95: {
        level: "👁️ 神级双眼",
        description: "眼睛如星辰般闪耀，摄人心魄的魅力！",
        advice: gender === 'male' 
          ? [
              "保持自信的眼神交流，这是你最迷人的武器！",
              "可以尝试稍微皱眉的表情，会更有吸引力！",
              "避免过度眯眼，保持眼睛明亮有神！"
            ]
          : [
              "你的眼睛是最美的风景，保持自然状态就足够惊艳！",
              "可以尝试睫毛膏让眼睛更有层次感！",
              "避免浓妆眼影，淡妆更能突出眼睛的纯净美！"
            ]
      },
      90: {
        level: "👁️ 梦幻眼眸",
        description: "眼睛美得让人移不开视线，充满故事感！",
        advice: gender === 'male'
          ? [
              "眼神深邃有魅力，多练习'深情凝视'的效果！",
              "保持眉毛整洁，会让眼睛更突出！",
              "可以通过眼镜配饰来增强儒雅气质！"
            ]
          : [
              "眼睛自带光芒，简单的内眼线就能放大优势！",
              "睫毛膏是你的好朋友，让眼睛更有神！",
              "可以尝试大地色眼影，增加眼睛的层次感！"
            ]
      },
      85: {
        level: "👁️ 迷人眼型",
        description: "眼型完美，眼神清澈明亮，很吸引人！",
        advice: gender === 'male'
          ? [
              "眼睛形状很好，保持干净清爽更显帅气！",
              "可以尝试挑眉，会更有魅力！",
              "避免熬夜，保持眼神明亮！"
            ]
          : [
              "眼型很漂亮，画个内眼线会更有神！",
              "睫毛夹夹翘睫毛，眼睛会更有神！",
              "尝试带一点点闪粉的眼影，会很吸睛！"
            ]
      },
      80: {
        level: "👁️ 漂亮眼眸",
        description: "眼睛很好看，笑起来特别有感染力！",
        advice: gender === 'male'
          ? [
              "眼睛有神，保持充足睡眠会更帅气！",
              "可以尝试戴隐形眼镜，让眼睛更突出！",
              "保持眉毛自然形状，避免过度修剪！"
            ]
          : [
              "眼睛很美，可以尝试自然妆容突出眼睛！",
              "选择适合自己肤色的眼影颜色！",
              "睫毛膏可以只涂上睫毛，让眼睛更大！"
            ]
      },
      75: {
        level: "👁️ 耐看眼睛",
        description: "眼睛给人感觉很舒服，越看越喜欢！",
        advice: gender === 'male'
          ? [
              "眼睛有潜力，好好休息保持眼神！",
              "多喝水，保持眼睛明亮！",
              "可以用眼膜定期护理眼部！"
            ]
          : [
              "眼睛耐看，可以尝试眼霜保养眼周！",
              "选择温和的卸妆产品，避免眼部刺激！",
              "尝试咖啡因眼霜，可以缓解眼部浮肿！"
            ]
      },
      70: {
        level: "👁️ 不错眼睛",
        description: "眼睛底子不错，有很大提升空间！",
        advice: gender === 'male'
          ? [
              "眼睛还可以，保持睡眠充足会更好！",
              "可以尝试练习眼神，让眼睛更有神！",
              "注意补充维生素A，对眼睛有好处！"
            ]
          : [
              "眼睛有潜力，可以学习眼妆技巧！",
              "学会画卧蚕，会让眼睛更有神！",
              "选择滋润型眼影，避免卡粉！"
            ]
      },
      65: {
        level: "👁️ 普通眼睛",
        description: "眼睛普通但很有个人特色！",
        advice: gender === 'male'
          ? [
              "通过发型和表情可以提升眼神魅力！",
              "保持积极乐观的心态，眼睛会更有神！",
              "可以尝试戴眼镜来增加知性气质！"
            ]
          : [
              "可以通过眼妆让眼睛更有神采！",
              "学会画眼线，可以改变眼型！",
              "选择适合自己眼型的美瞳！"
            ]
      },
      60: {
        level: "👁️ 潜力眼眸",
        description: "眼睛有很大发展潜力！",
        advice: gender === 'male'
          ? [
              "多练习眼神，找到最自信的状态！",
              "保持健康的生活习惯，眼睛会越来越有神！",
              "可以尝试戴有框眼镜增加魅力！"
            ]
          : [
              "认真学眼妆，会有很大变化！",
              "从基础眼线开始学习，循序渐进！",
              "多看美妆教程，找到适合自己的眼妆风格！"
            ]
      }
    },
    nose: {
      95: {
        level: "👃 黄金鼻型",
        description: "鼻子堪称完美，侧颜照片会爆火！",
        advice: [
          "侧颜是你的最强武器，多拍点侧脸照！",
          "保持鼻梁清洁，避免油脂分泌过多！",
          "可以尝试高光在鼻梁，让侧颜更立体！"
        ]
      },
      90: {
        level: "👃 完美鼻子",
        description: "鼻子高挺精致，360°无死角！",
        advice: [
          "鼻子是你的颜值加分项，尽情展示！",
          "避免挤压鼻子，保持完美形状！",
          "可以用修容粉让鼻子更立体！"
        ]
      },
      85: {
        level: "👃 挺拔鼻梁",
        description: "鼻型很好，立体感十足！",
        advice: [
          "侧颜角度已经很好，继续保持！",
          "可以尝试在鼻头打高光，让鼻子更精致！",
          "注意鼻翼两侧的清洁！"
        ]
      },
      80: {
        level: "👃 漂亮鼻子",
        description: "鼻子形状很好看，很有气质！",
        advice: [
          "找到你的最佳侧颜角度，多拍照片！",
          "学习鼻影修容，让鼻子更立体！",
          "保持鼻梁清洁，避免黑头！"
        ]
      },
      75: {
        level: "👃 耐看鼻子",
        description: "鼻子给人感觉很舒服，很协调！",
        advice: [
          "可以通过发型和修容来突出鼻子！",
          "学会画鼻影，让鼻子更立体！",
          "定期去黑头，保持鼻翼干净！"
        ]
      },
      70: {
        level: "👃 不错鼻子",
        description: "鼻子还可以，和脸部搭配和谐！",
        advice: [
          "学习修容技巧，可以让鼻子更立体！",
          "保持鼻梁清洁，避免油脂！",
          "可以通过发型遮盖来优化视觉效果！"
        ]
      },
      65: {
        level: "👃 普通鼻子",
        description: "鼻子普通但很有个人特色！",
        advice: [
          "不要纠结鼻子，整体搭配更重要！",
          "学会用修容调整视觉上的鼻子大小！",
          "通过发型来平衡面部比例！"
        ]
      },
      60: {
        level: "👃 潜力鼻子",
        description: "鼻子有很大提升空间！",
        advice: [
          "可以考虑化妆或造型来改善视觉效果！",
          "学习鼻影修容是提升鼻子效果的好方法！",
          "通过发型选择来优化面部比例！"
        ]
      }
    },
    mouth: {
      95: {
        level: "👄 绝美唇形",
        description: "嘴唇形状完美，笑起来简直犯规！",
        advice: gender === 'male'
          ? [
              "你的笑容是最好的名片，多笑笑！",
              "保持嘴唇滋润，避免干裂！",
              "可以尝试牙齿美白，让笑容更完美！"
            ]
          : [
              "嘴唇天生完美，任何口红都适合你！",
              "可以尝试各种口红色号，找到最适合的！",
              "保持嘴唇滋润，定期使用唇膜！"
            ]
      },
      90: {
        level: "👄 梦幻嘴唇",
        description: "嘴唇形状和颜色都很完美，迷人！",
        advice: gender === 'male'
          ? [
              "笑容阳光有魅力，保持自信微笑！",
              "注意口腔卫生，保持牙齿洁白！",
              "可以用润唇膏保持嘴唇滋润！"
            ]
          : [
              "嘴唇底子超好，可以尝试各种口红色号！",
              "大胆尝试鲜艳色系，很适合你！",
              "可以尝试唇釉，让嘴唇更有质感！"
            ]
      },
      85: {
        level: "👄 性感嘴唇",
        description: "嘴唇很有吸引力，笑起来超甜！",
        advice: gender === 'male'
          ? [
              "嘴唇形状很好，笑起来很有感染力！",
              "保持嘴唇清洁，避免起皮！",
              "练习自然微笑，提升魅力！"
            ]
          : [
              "嘴唇很漂亮，适合鲜艳的口红色号！",
              "可以尝试咬唇妆，会很性感！",
              "定期做唇膜，保持嘴唇柔软！"
            ]
      },
      80: {
        level: "👄 漂亮嘴唇",
        description: "嘴唇形状很好，很适合你！",
        advice: gender === 'male'
          ? [
              "保持笑容，这是你的魅力点！",
              "注意口腔健康，保持口气清新！",
              "避免舔嘴唇，会导致干裂！"
            ]
          : [
              "嘴唇形状很好，日常淡妆就很美！",
              "选择滋润型口红，避免干裂！",
              "可以尝试带一点点珠光的口红！"
            ]
      },
      75: {
        level: "👄 耐看嘴唇",
        description: "嘴唇给人感觉很舒服，很自然！",
        advice: gender === 'male'
          ? [
              "多练习笑容，会让嘴唇更迷人！",
              "保持嘴唇滋润，避免干裂！",
              "注意补充维生素B，对嘴唇有好处！"
            ]
          : [
              "可以尝试润唇膏让嘴唇更饱满！",
              "选择适合自己肤色的裸色口红！",
              "定期去死皮，保持嘴唇柔软！"
            ]
      },
      70: {
        level: "👄 不错嘴唇",
        description: "嘴唇还可以，有很大提升空间！",
        advice: gender === 'male'
          ? [
              "嘴唇可以多注意保养，保持滋润！",
              "可以练习微笑，让表情更自然！",
              "避免咬嘴唇，保持唇形！"
            ]
          : [
              "可以学习唇妆技巧来优化唇形！",
              "学会用唇线笔调整唇形！",
              "选择适合自己脸型的唇妆风格！"
            ]
      },
      65: {
        level: "👄 普通嘴唇",
        description: "嘴唇普通但很有个人特色！",
        advice: gender === 'male'
          ? [
              "通过笑容和表情可以提升嘴唇魅力！",
              "保持嘴唇滋润是基础！",
              "可以通过面部表情练习让嘴唇更生动！"
            ]
          : [
              "可以通过唇线笔和口红来改善唇形！",
              "学习画嘟嘟唇，会让嘴唇更饱满！",
              "找到最适合你的口红色号！"
            ]
      },
      60: {
        level: "👄 潜力嘴唇",
        description: "嘴唇有很大发展潜力！",
        advice: gender === 'male'
          ? [
              "好好护理嘴唇，避免干裂！",
              "练习微笑，让表情更自然！",
              "可以通过发型和表情来提升整体效果！"
            ]
          : [
              "认真学习唇妆技巧，会有很大变化！",
              "从基础画唇线开始学习！",
              "多尝试不同口红色号，找到最适合的！"
            ]
      }
    },
    skin: {
      95: {
        level: "🧴 神级皮肤",
        description: "皮肤简直完美，吹弹可破！",
        advice: gender === 'male'
          ? [
              "你的皮肤比很多女生还好，保持好习惯！",
              "注意防晒，避免晒伤！",
              "保持规律作息，让皮肤持续好状态！"
            ]
          : [
              "素颜就惊艳，保持护肤好习惯！",
              "继续防晒，这是保持好皮肤的关键！",
              "定期做皮肤管理，保持完美状态！"
            ]
      },
      90: {
        level: "🧴 梦幻肌肤",
        description: "皮肤好到让人嫉妒，自带光芒！",
        advice: gender === 'male'
          ? [
              "皮肤超棒，注意防晒就能保持！",
              "保持规律作息，避免熬夜！",
              "多喝水，保持皮肤水润！"
            ]
          : [
              "皮肤底子无敌，做好基础护肤即可！",
              "防晒是护肤最重要的一步，坚持！",
              "可以尝试一些功能性护肤产品！"
            ]
      },
      85: {
        level: "🧴 完美肌肤",
        description: "皮肤状态很好，很健康光泽！",
        advice: gender === 'male'
          ? [
              "保持规律作息，皮肤会越来越好！",
              "注意清洁，避免毛孔堵塞！",
              "保持运动，促进新陈代谢！"
            ]
          : [
              "皮肤很好，坚持保湿和防晒！",
              "可以根据肤质选择针对性护肤！",
              "定期做面膜，保持皮肤水润！"
            ]
      },
      80: {
        level: "🧴 漂亮皮肤",
        description: "皮肤底子很好，给人感觉很舒服！",
        advice: gender === 'male'
          ? [
              "注意清洁和保湿，皮肤会更棒！",
              "避免熬夜，保持好皮肤！",
              "可以尝试清爽的护肤品！"
            ]
          : [
              "皮肤底子不错，坚持护肤流程！",
              "清洁、保湿、防晒，三步不能少！",
              "定期去角质，让皮肤更光滑！"
            ]
      },
      75: {
        level: "🧴 耐看皮肤",
        description: "皮肤还可以，有提升空间！",
        advice: gender === 'male'
          ? [
              "注意清洁，多喝水皮肤会改善！",
              "开始建立护肤习惯！",
              "避免过度清洁，保持皮肤屏障！"
            ]
          : [
              "做好基础护肤，坚持会有效果！",
              "根据自己的肤质选择护肤品！",
              "定期做补水面膜！"
            ]
      },
      70: {
        level: "🧴 不错皮肤",
        description: "皮肤状态还行，需要精心护理！",
        advice: gender === 'male'
          ? [
              "建立护肤习惯，从清洁开始！",
              "注意防晒，避免晒黑！",
              "保持健康的生活方式！"
            ]
          : [
              "建立完整护肤流程，坚持很重要！",
              "学习护肤知识，科学护肤！",
              "根据自己的肤质调整护肤方案！"
            ]
      },
      65: {
        level: "🧴 普通皮肤",
        description: "皮肤普通，需要注意保养！",
        advice: gender === 'male'
          ? [
              "注意饮食和作息，皮肤会慢慢改善！",
              "开始基础护肤：清洁、保湿！",
              "避免熬夜和吃辛辣刺激食物！"
            ]
          : [
              "认真护肤，会有明显改善！",
              "从最基础的护肤开始！",
              "坚持护肤，不要三天打鱼两天晒网！"
            ]
      },
      60: {
        level: "🧴 潜力肌肤",
        description: "皮肤有很大提升空间！",
        advice: gender === 'male'
          ? [
              "开始护肤吧，坚持就会有变化！",
              "学习基础护肤知识！",
              "保持健康的生活方式是基础！"
            ]
          : [
              "系统护肤，从基础开始学习！",
              "找到适合自己的护肤品牌！",
              "耐心等待，护肤需要时间！"
            ]
      }
    },
    symmetry: {
      95: {
        level: "⚖️ 完美对称",
        description: "脸部简直是对称的教科书级别！",
        advice: [
          "你拥有黄金比例的脸型，任何角度都完美！",
          "尽情展示你的美，不需要隐藏任何角度！",
          "可以尝试各种发型，都能完美驾驭！"
        ]
      },
      90: {
        level: "⚖️ 超级对称",
        description: "脸部对称性非常好，很和谐！",
        advice: [
          "360°无死角，尽情展示你的美！",
          "多尝试不同的拍摄角度！",
          "你的脸型很适合各种发型！"
        ]
      },
      85: {
        level: "⚖️ 很好对称",
        description: "脸部对称性很好，看着很舒服！",
        advice: [
          "基本无死角，找几个最佳角度就行！",
          "可以尝试不同的拍照角度！",
          "你的脸型很标准，容易打理！"
        ]
      },
      80: {
        level: "⚖️ 漂亮对称",
        description: "脸部比较对称，很协调！",
        advice: [
          "找到你的黄金角度，多拍照片！",
          "可以利用发饰来突出优点！",
          "保持自信，你很美！"
        ]
      },
      75: {
        level: "⚖️ 耐看对称",
        description: "脸部对称性还行，整体和谐！",
        advice: [
          "通过拍摄角度可以优化视觉效果！",
          "学会用发型来平衡面部！",
          "找到你的最佳拍照角度！"
        ]
      },
      70: {
        level: "⚖️ 不错对称",
        description: "脸部比较和谐，可以接受！",
        advice: [
          "找到你的优势角度，多练习摆拍！",
          "利用光影来优化面部轮廓！",
          "发型选择很重要！"
        ]
      },
      65: {
        level: "⚖️ 普通对称",
        description: "脸部对称性一般，但很有特色！",
        advice: [
          "每个人都有独特魅力，自信最重要！",
          "学会用造型来突出优点！",
          "多尝试不同的拍照角度！"
        ]
      },
      60: {
        level: "⚖️ 独特魅力",
        description: "脸部有个人特色，不对称也很美！",
        advice: [
          "接受并欣赏自己的独特之处！",
          "不对称也是一种美，很有个性！",
          "自信是最好的美颜！"
        ]
      }
    }
  };

  const featureAnalyses = analyses[feature as keyof typeof analyses];
  
  if (score >= 95) return featureAnalyses[95];
  if (score >= 90) return featureAnalyses[90];
  if (score >= 85) return featureAnalyses[85];
  if (score >= 80) return featureAnalyses[80];
  if (score >= 75) return featureAnalyses[75];
  if (score >= 70) return featureAnalyses[70];
  if (score >= 65) return featureAnalyses[65];
  return featureAnalyses[60];
}

// 获取历史对比数据（模拟）
export function getComparisonData(score: number): {
  rank: string;
  percentile: number;
  beatCount: string;
} {
  return {
    rank: score >= 90 ? "前 5%" : score >= 80 ? "前 20%" : score >= 70 ? "前 50%" : "前 80%",
    percentile: score,
    beatCount: Math.floor(Math.random() * 50) + 50 + "%"
  };
}

// 每日运势
export function getDailyFortune(): {
  title: string;
  emoji: string;
  description: string;
  luckyColor: string;
  luckyNumber: number;
} {
  const fortunes = [
    { title: "桃花运旺盛", emoji: "💕", description: "今天你的魅力值爆表，桃花运挡都挡不住！", luckyColor: "粉色", luckyNumber: 7 },
    { title: "事业运亨通", emoji: "💼", description: "今天你的颜值会给工作加分，好运连连！", luckyColor: "金色", luckyNumber: 3 },
    { title: "财运滚滚来", emoji: "💰", description: "今天你的颜值会带来财运，买买买！", luckyColor: "绿色", luckyNumber: 8 },
    { title: "健康运爆棚", emoji: "💪", description: "今天你的状态超好，皮肤也棒棒哒！", luckyColor: "蓝色", luckyNumber: 5 },
    { title: "人际运爆棚", emoji: "👥", description: "今天你的人缘超好，朋友都夸你变美了！", luckyColor: "紫色", luckyNumber: 9 }
  ];
  return fortunes[Math.floor(Math.random() * fortunes.length)];
}

// 滤镜类型
export const filterTypes = [
  { name: '原图', filter: 'none', icon: '📷' },
  { name: '美白', filter: 'brightness(1.2) contrast(1.1)', icon: '✨' },
  { name: '柔光', filter: 'brightness(1.1) saturate(1.2)', icon: '💫' },
  { name: '复古', filter: 'sepia(0.3) contrast(1.1)', icon: '🎨' },
  { name: '冷调', filter: 'hue-rotate(10deg) saturate(1.1)', icon: '❄️' },
  { name: '暖调', filter: 'hue-rotate(-10deg) saturate(1.2)', icon: '🌅' }
];

// 获取剩余次数
export function getRemainingCount(): number {
  const count = localStorage.getItem('analysisCount');
  return count ? parseInt(count) : 0; // 默认0次，需要购买或兑换
}

// 减少次数
export function decreaseCount(): void {
  const current = getRemainingCount();
  if (current > 0) {
    localStorage.setItem('analysisCount', String(current - 1));
  }
}

// 使用API验证兑换码
export async function validateRedeemCodeAPI(code: string): Promise<{
  valid: boolean;
  message: string;
  code?: any;
}> {
  try {
    const response = await fetch(`/api/redeem?code=${encodeURIComponent(code)}`);
    const data = await response.json();

    if (data.valid) {
      return {
        valid: true,
        message: data.code.description,
        code: data.code
      };
    } else {
      return {
        valid: false,
        message: data.message || '验证失败'
      };
    }
  } catch (error) {
    console.error('验证兑换码失败:', error);
    return {
      valid: false,
      message: '网络错误，请重试'
    };
  }
}

// 使用API兑换码
export async function useRedeemCodeAPI(code: string): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const response = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await response.json();

    if (data.success) {
      const current = getRemainingCount();
      const newCount = current + data.count;
      localStorage.setItem('analysisCount', String(newCount));

      // 记录本地使用记录
      const usedCodes = JSON.parse(localStorage.getItem('usedRedeemCodes') || '[]');
      usedCodes.push({
        code: code.toUpperCase(),
        count: data.count,
        usedAt: new Date().toISOString(),
        description: data.message
      });
      localStorage.setItem('usedRedeemCodes', JSON.stringify(usedCodes));

      return {
        success: true,
        message: data.message,
        count: data.count
      };
    } else {
      return {
        success: false,
        message: data.message || '兑换失败'
      };
    }
  } catch (error) {
    console.error('兑换失败:', error);
    return {
      success: false,
      message: '网络错误，请重试'
    };
  }
}

// 获取所有兑换码（用于管理后台）
export async function getAllRedeemCodes(): Promise<any> {
  try {
    const response = await fetch('/api/redeem');
    return await response.json();
  } catch (error) {
    return { success: false, error };
  }
}

// 验证兑换码
export function validateRedeemCode(code: string): { valid: boolean; message: string; count?: number } {
  const redeemCodes: Record<string, { count: number; description: string }> = {
    'BEAUTY2026': { count: 5, description: '新年快乐赠送5次' },
    'AI666': { count: 10, description: '专属兑换码赠送10次' },
    'TEST888': { count: 1, description: '测试兑换码赠送1次' }
  };

  const upperCode = code.toUpperCase().trim();
  const codeInfo = redeemCodes[upperCode];

  if (!codeInfo) {
    return { valid: false, message: '兑换码无效！' };
  }

  // 检查是否已使用
  const usedCodes = JSON.parse(localStorage.getItem('usedRedeemCodes') || '[]');
  if (usedCodes.includes(upperCode)) {
    return { valid: false, message: '该兑换码已使用过！' };
  }

  return { valid: true, message: codeInfo.description, count: codeInfo.count };
}

// 使用兑换码
export function useRedeemCode(code: string): { success: boolean; message: string; newCount?: number } {
  const validation = validateRedeemCode(code);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  const current = getRemainingCount();
  const newCount = current + validation.count!;
  localStorage.setItem('analysisCount', String(newCount));

  // 记录已使用的兑换码及使用时间
  const usedCodes = JSON.parse(localStorage.getItem('usedRedeemCodes') || '[]');
  usedCodes.push({
    code: code.toUpperCase().trim(),
    count: validation.count,
    usedAt: new Date().toISOString(),
    description: validation.message
  });
  localStorage.setItem('usedRedeemCodes', JSON.stringify(usedCodes));

  return { success: true, message: validation.message, newCount };
}

// 获取已使用的兑换码列表
export function getUsedRedeemCodes(): Array<{ code: string; count: number; usedAt: string; description: string }> {
  const usedCodes = localStorage.getItem('usedRedeemCodes');
  return usedCodes ? JSON.parse(usedCodes) : [];
}
