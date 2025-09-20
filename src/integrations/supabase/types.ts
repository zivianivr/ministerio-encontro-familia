export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      casais: {
        Row: {
          atualizado_em: string
          bairro: string | null
          comunidade: string | null
          contato_ela: string | null
          contato_ele: string | null
          criado_em: string
          data_ecc: string | null
          data_nascimento_ela: string | null
          data_nascimento_ele: string | null
          ecc_primeira_etapa: string | null
          endereco: string | null
          foto_url: string | null
          id: string
          local_ecc: string | null
          nome_ela: string
          nome_ele: string
          numero_inscricao: number
          paroquia: string
          religiao_ela: string | null
          religiao_ele: string | null
        }
        Insert: {
          atualizado_em?: string
          bairro?: string | null
          comunidade?: string | null
          contato_ela?: string | null
          contato_ele?: string | null
          criado_em?: string
          data_ecc?: string | null
          data_nascimento_ela?: string | null
          data_nascimento_ele?: string | null
          ecc_primeira_etapa?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          local_ecc?: string | null
          nome_ela: string
          nome_ele: string
          numero_inscricao: number
          paroquia: string
          religiao_ela?: string | null
          religiao_ele?: string | null
        }
        Update: {
          atualizado_em?: string
          bairro?: string | null
          comunidade?: string | null
          contato_ela?: string | null
          contato_ele?: string | null
          criado_em?: string
          data_ecc?: string | null
          data_nascimento_ela?: string | null
          data_nascimento_ele?: string | null
          ecc_primeira_etapa?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          local_ecc?: string | null
          nome_ela?: string
          nome_ele?: string
          numero_inscricao?: number
          paroquia?: string
          religiao_ela?: string | null
          religiao_ele?: string | null
        }
        Relationships: []
      }
      encontros: {
        Row: {
          atualizado_em: string
          casais_inscritos: number | null
          criado_em: string
          data_fim: string | null
          data_inicio: string
          etapa: string | null
          id: string
          local: string
          nome: string
          status: string | null
        }
        Insert: {
          atualizado_em?: string
          casais_inscritos?: number | null
          criado_em?: string
          data_fim?: string | null
          data_inicio: string
          etapa?: string | null
          id?: string
          local: string
          nome: string
          status?: string | null
        }
        Update: {
          atualizado_em?: string
          casais_inscritos?: number | null
          criado_em?: string
          data_fim?: string | null
          data_inicio?: string
          etapa?: string | null
          id?: string
          local?: string
          nome?: string
          status?: string | null
        }
        Relationships: []
      }
      equipe_membros: {
        Row: {
          casal_id: string
          criado_em: string
          equipe_id: string
          id: string
          posicao: string | null
        }
        Insert: {
          casal_id: string
          criado_em?: string
          equipe_id: string
          id?: string
          posicao?: string | null
        }
        Update: {
          casal_id?: string
          criado_em?: string
          equipe_id?: string
          id?: string
          posicao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipe_membros_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipe_membros_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          ativa: boolean
          atualizado_em: string
          coordenador_casal_id: string | null
          criado_em: string
          descricao: string | null
          id: string
          nome: string
          tipo_equipe_id: string
        }
        Insert: {
          ativa?: boolean
          atualizado_em?: string
          coordenador_casal_id?: string | null
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo_equipe_id: string
        }
        Update: {
          ativa?: boolean
          atualizado_em?: string
          coordenador_casal_id?: string | null
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo_equipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipes_coordenador_casal_id_fkey"
            columns: ["coordenador_casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_tipo_equipe_id_fkey"
            columns: ["tipo_equipe_id"]
            isOneToOne: false
            referencedRelation: "tipos_equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_equipes: {
        Row: {
          cor: string
          descricao: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          cor: string
          descricao: string
          id: string
          nome: string
          ordem?: number
        }
        Update: {
          cor?: string
          descricao?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
