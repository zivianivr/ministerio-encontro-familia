import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Casal, Equipe } from '@/types/ecc';

export const useSupabaseData = () => {
  const [casais, setCasais] = useState<Casal[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCasais = async () => {
    try {
      const { data, error } = await supabase
        .from('casais')
        .select('*')
        .order('numero_inscricao');

      if (error) throw error;

      const casaisFormatted: Casal[] = data?.map(casal => ({
        id: casal.id,
        numeroInscricao: casal.numero_inscricao,
        nomeEle: casal.nome_ele,
        religiaoEle: casal.religiao_ele,
        contatoEle: casal.contato_ele,
        nomeEla: casal.nome_ela,
        religiaoEla: casal.religiao_ela,
        contatoEla: casal.contato_ela,
        paroquia: casal.paroquia,
        comunidade: casal.comunidade,
        bairro: casal.bairro,
        endereco: casal.endereco,
        eccPrimeiraEtapa: casal.ecc_primeira_etapa,
        dataEcc: casal.data_ecc,
        localEcc: casal.local_ecc,
        fotoUrl: casal.foto_url,
        criadoEm: new Date(casal.criado_em),
        atualizadoEm: new Date(casal.atualizado_em)
      })) || [];

      setCasais(casaisFormatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar casais');
    }
  };

  const fetchEquipes = async () => {
    try {
      const { data, error } = await supabase
        .from('equipes')
        .select(`
          *,
          tipos_equipes(nome, descricao, cor),
          coordenador:casais!coordenador_casal_id(*),
          equipe_membros(
            casal:casais(*)
          )
        `)
        .eq('ativa', true);

      if (error) throw error;

      // Transformar dados do Supabase para o formato da aplicação
      const equipesFormatted: Equipe[] = data?.map(equipe => {
        const formatCasal = (casalData: any) => casalData ? ({
          id: casalData.id,
          numeroInscricao: casalData.numero_inscricao,
          nomeEle: casalData.nome_ele,
          religiaoEle: casalData.religiao_ele || '',
          contatoEle: casalData.contato_ele || '',
          nomeEla: casalData.nome_ela,
          religiaoEla: casalData.religiao_ela || '',
          contatoEla: casalData.contato_ela || '',
          paroquia: casalData.paroquia,
          comunidade: casalData.comunidade || '',
          bairro: casalData.bairro || '',
          endereco: casalData.endereco || '',
          eccPrimeiraEtapa: casalData.ecc_primeira_etapa || '',
          dataEcc: casalData.data_ecc || '',
          localEcc: casalData.local_ecc || '',
          fotoUrl: casalData.foto_url,
          criadoEm: new Date(casalData.criado_em),
          atualizadoEm: new Date(casalData.atualizado_em)
        }) : null;

        return {
          id: equipe.id,
          nome: equipe.nome,
          coordenador: {
            casal: formatCasal(equipe.coordenador)!,
            numeroInscricao: equipe.coordenador?.numero_inscricao || 0
          },
          casais: equipe.equipe_membros?.map((membro: any) => ({
            casal: formatCasal(membro.casal)!,
            numeroInscricao: membro.casal?.numero_inscricao || 0
          })) || [],
          descricao: equipe.descricao
        };
      }) || [];
      
      setEquipes(equipesFormatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipes');
    }
  };

  const insertCasal = async (casal: Omit<Casal, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      const { data, error } = await supabase
        .from('casais')
        .insert({
          numero_inscricao: casal.numeroInscricao,
          nome_ele: casal.nomeEle,
          religiao_ele: casal.religiaoEle,
          contato_ele: casal.contatoEle,
          nome_ela: casal.nomeEla,
          religiao_ela: casal.religiaoEla,
          contato_ela: casal.contatoEla,
          paroquia: casal.paroquia,
          comunidade: casal.comunidade,
          bairro: casal.bairro,
          endereco: casal.endereco,
          ecc_primeira_etapa: casal.eccPrimeiraEtapa,
          data_ecc: casal.dataEcc,
          local_ecc: casal.localEcc,
          foto_url: casal.fotoUrl
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchCasais(); // Recarregar lista
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao inserir casal');
    }
  };

  const updateCasal = async (id: string, updates: Partial<Casal>) => {
    try {
      const { data, error } = await supabase
        .from('casais')
        .update({
          ...(updates.numeroInscricao && { numero_inscricao: updates.numeroInscricao }),
          ...(updates.nomeEle && { nome_ele: updates.nomeEle }),
          ...(updates.religiaoEle && { religiao_ele: updates.religiaoEle }),
          ...(updates.contatoEle && { contato_ele: updates.contatoEle }),
          ...(updates.nomeEla && { nome_ela: updates.nomeEla }),
          ...(updates.religiaoEla && { religiao_ela: updates.religiaoEla }),
          ...(updates.contatoEla && { contato_ela: updates.contatoEla }),
          ...(updates.paroquia && { paroquia: updates.paroquia }),
          ...(updates.comunidade && { comunidade: updates.comunidade }),
          ...(updates.bairro && { bairro: updates.bairro }),
          ...(updates.endereco && { endereco: updates.endereco }),
          ...(updates.eccPrimeiraEtapa && { ecc_primeira_etapa: updates.eccPrimeiraEtapa }),
          ...(updates.dataEcc && { data_ecc: updates.dataEcc }),
          ...(updates.localEcc && { local_ecc: updates.localEcc }),
          ...(updates.fotoUrl && { foto_url: updates.fotoUrl }),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCasais(); // Recarregar lista
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar casal');
    }
  };

  const deleteCasal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('casais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchCasais(); // Recarregar lista
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar casal');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCasais(), fetchEquipes()]);
      setLoading(false);
    };

    loadData();

    // Configurar real-time subscriptions
    const casaisSubscription = supabase
      .channel('casais-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'casais' 
      }, () => {
        fetchCasais();
      })
      .subscribe();

    const equipesSubscription = supabase
      .channel('equipes-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'equipes' 
      }, () => {
        fetchEquipes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(casaisSubscription);
      supabase.removeChannel(equipesSubscription);
    };
  }, []);

  return {
    casais,
    equipes,
    loading,
    error,
    insertCasal,
    updateCasal,
    deleteCasal,
    refetch: () => Promise.all([fetchCasais(), fetchEquipes()])
  };
};