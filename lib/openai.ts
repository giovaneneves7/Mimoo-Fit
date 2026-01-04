// OpenAI Vision API para análise de refeições

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'

export interface MealAnalysis {
  success: boolean
  error?: string
  nome: string
  calorias: number
  carboidratos: number
  proteinas: number
  gorduras: number
  confianca: number
  observacoes?: string
}

export async function analyzeMealPhoto(base64Image: string): Promise<MealAnalysis> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um nutricionista especialista em análise de alimentos.
              Analise a imagem da refeição e forneça estimativas PRECISAS.
              
              IMPORTANTE: Se a imagem NÃO contém comida (ex: objetos, paisagens, pessoas),
              retorne: {"success": false, "error": "not_food", "nome": "", "calorias": 0, "carboidratos": 0, "proteinas": 0, "gorduras": 0, "confianca": 0}
              
              Se contém comida, retorne JSON com:
              {
                "success": true,
                "nome": "Nome descritivo do prato",
                "calorias": número estimado,
                "carboidratos": gramas,
                "proteinas": gramas,
                "gorduras": gramas,
                "confianca": 0.0 a 1.0,
                "observacoes": "dicas nutricionais (opcional)"
              }
              
              Responda APENAS com o JSON, sem texto adicional.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'low',
                },
              },
              {
                type: 'text',
                text: 'Analise esta refeição e forneça os valores nutricionais em JSON.',
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Resposta vazia da API')
    }

    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta')
    }

    const analysis = JSON.parse(jsonMatch[0])
    return analysis
  } catch (error: any) {
    console.error('Erro ao analisar foto:', error)
    return {
      success: false,
      error: error.message,
      nome: '',
      calorias: 0,
      carboidratos: 0,
      proteinas: 0,
      gorduras: 0,
      confianca: 0,
    }
  }
}

