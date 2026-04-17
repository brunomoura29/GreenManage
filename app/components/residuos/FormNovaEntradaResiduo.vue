<template>
  <div class="min-h-full">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="px-6 md:px-8 pt-8 pb-6 flex items-center gap-4">
      <button
        @click="$emit('voltar')"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Voltar"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          {{ !isNovo ? 'Editar Detalhe' : entradaId ? 'Adicionar Detalhe' : 'Nova Entrada de Resíduo' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ !isNovo ? 'Edite as informações do registro.' : entradaId ? 'Preencha os dados do novo resíduo para esta entrada.' : 'Preencha as informações da movimentação de entrada.' }}
        </p>
      </div>
    </div>

    <!-- ── Abas ─────────────────────────────────────────────────────────────── -->
    <div class="px-6 md:px-8">
      <div class="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          v-for="(aba, i) in abas"
          :key="i"
          type="button"
          @click="abaAtiva = i"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative"
          :class="abaAtiva === i
            ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5 dark:bg-primary/10'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
        >
          <component :is="aba.icone" class="w-4 h-4" />
          <span>{{ aba.label }}</span>
          <span
            v-if="aba.erro"
            class="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5"
          />
        </button>
      </div>
    </div>

    <!-- ── Conteúdo das abas ────────────────────────────────────────────────── -->
    <form class="px-6 md:px-8 pb-28 pt-6 space-y-8" @submit.prevent="salvar">

      <!-- ══ ABA 1: Documento ══════════════════════════════════════════════════ -->
      <div v-show="abaAtiva === 0" class="space-y-6">

        <!-- MTR SINIR -->
        <section>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Documento de Movimentação
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- MTR SINIR – pesquisa -->
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                MTR SINIR
              </label>
              <div class="relative" ref="refMtrDocumento">
                <div class="relative">
                  <Loader2 v-if="buscandoMtr" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin pointer-events-none" />
                  <Search v-else class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="mtrDocumentoBusca"
                    type="text"
                    placeholder="Digite o número do MTR e pressione Enter..."
                    :disabled="buscandoMtr"
                    @focus="mtrDocumentoAberto = true"
                    @input="filtrarMtrsDocumento"
                    @keyup.enter.prevent="buscarNoSinir(mtrDocumentoBusca)"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition disabled:opacity-60"
                  />
                </div>
                <div
                  v-if="mtrDocumentoAberto && (mtrDocumentosFiltrados.length > 0 || mtrDocumentoBusca.length >= 8)"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="item in mtrDocumentosFiltrados"
                    :key="item.unique_id ?? item.id"
                    type="button"
                    @click="selecionarMtrDocumento(item)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FileText class="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ item.mtr }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.nota_fiscal ? `NF: ${item.nota_fiscal}` : 'Sem nota fiscal' }}</p>
                    </div>
                  </button>
                  <button
                    v-if="mtrDocumentoBusca.length >= 8"
                    type="button"
                    @click="buscarNoSinir(mtrDocumentoBusca)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors text-primary"
                    :class="mtrDocumentosFiltrados.length > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''"
                  >
                    <Search class="w-4 h-4 shrink-0" />
                    <span>Buscar <strong>{{ mtrDocumentoBusca }}</strong> no SINIR</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Nº da Nota Fiscal -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nº da Nota Fiscal
              </label>
              <input
                v-model="form.nota_fiscal"
                type="text"
                placeholder="Ex: 000123"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            <!-- Nº da Descarga -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nº da Descarga
              </label>
              <input
                :value="form.discharge_number ?? '—'"
                type="text"
                readonly
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <!-- Data da Coleta -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Data da Coleta
              </label>
              <input
                v-model="form.data_coleta"
                type="date"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            <!-- Data do Recebimento -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Data do Recebimento <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.date"
                type="date"
                required
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

          </div>
        </section>

        <!-- Veículo e Motorista -->
        <section>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Veículo e Motorista
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Placa do Veículo – pesquisa -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Placa do Veículo
              </label>
              <div class="relative" ref="refVeiculo">
                <div class="relative">
                  <Car class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="veiculoBusca"
                    type="text"
                    placeholder="Digite a placa..."
                    @focus="veiculoAberto = true"
                    @input="filtrarVeiculos"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <button
                    v-if="form.veiculo_plate"
                    type="button"
                    @click="limparVeiculo"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-if="veiculoAberto && veiculosFiltrados.length > 0"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="v in veiculosFiltrados"
                    :key="v.id"
                    type="button"
                    @click="selecionarVeiculo(v)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Truck class="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ v.plate }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ v.model }} · {{ v.vehicle_type }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Motorista – pesquisa -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Motorista
              </label>
              <div class="relative" ref="refMotorista">
                <div class="relative">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="motoristaBusca"
                    type="text"
                    placeholder="Digite o nome do motorista..."
                    @focus="motoristaAberto = true"
                    @input="filtrarMotoristas"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <button
                    v-if="form.motorista_id"
                    type="button"
                    @click="limparMotorista"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-if="motoristaAberto && motoristasFiltrados.length > 0"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="m in motoristasFiltrados"
                    :key="m.id"
                    type="button"
                    @click="selecionarMotorista(m)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User class="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ m.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">CPF: {{ m.cpf ?? '—' }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>


      </div>

      <!-- ══ ABA 2: Transportadora ═════════════════════════════════════════════ -->
      <div v-show="abaAtiva === 1" class="space-y-6">

        <section>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Dados da Transportadora
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Nome Fantasia – pesquisa -->
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nome (Nome Fantasia)
              </label>
              <div class="relative" ref="refTransportadora">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="transportadoraBusca"
                    type="text"
                    placeholder="Buscar transportadora..."
                    @focus="transportadoraAberta = true"
                    @input="filtrarTransportadoras"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <button
                    v-if="form.carrier"
                    type="button"
                    @click="limparTransportadora"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-if="transportadoraAberta && transportadorasFiltradas.length > 0"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="t in transportadorasFiltradas"
                    :key="t.id"
                    type="button"
                    @click="selecionarTransportadora(t)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Building2 class="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ t.nome_fantasia }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ t.razao_social }} · CNPJ: {{ t.cnpj ?? '—' }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- CNPJ – somente leitura após seleção -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                CNPJ
              </label>
              <input
                :value="transportadoraSelecionada?.cnpj ?? ''"
                type="text"
                placeholder="Preenchido automaticamente"
                readonly
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 cursor-not-allowed"
              />
            </div>

            <!-- Código SINIR – somente leitura após seleção -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Código no SINIR
              </label>
              <input
                :value="transportadoraSelecionada?.codigo_sinir ?? ''"
                type="text"
                placeholder="Preenchido automaticamente"
                readonly
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 cursor-not-allowed"
              />
            </div>

          </div>
        </section>

        <!-- MTR(s) da transportadora -->
        <section>
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
              MTR(s) da Transportadora
            </h2>
            <button
              type="button"
              @click="adicionarMtrTransportadora"
              class="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-600 transition-colors"
            >
              <Plus class="w-4 h-4" />
              Adicionar MTR
            </button>
          </div>

          <div v-if="form.mtrs_transportadora.length === 0" class="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
            <FileText class="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p class="text-sm text-slate-500 dark:text-slate-400">Nenhum MTR adicionado.</p>
            <button
              type="button"
              @click="adicionarMtrTransportadora"
              class="mt-2 text-xs font-medium text-primary hover:underline"
            >
              Adicionar o primeiro
            </button>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(_, idx) in form.mtrs_transportadora"
              :key="idx"
              class="flex items-center gap-3"
            >
              <div class="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                {{ idx + 1 }}
              </div>
              <input
                v-model="form.mtrs_transportadora[idx]"
                type="text"
                :placeholder="`MTR ${idx + 1}`"
                class="flex-1 px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              <button
                type="button"
                @click="removerMtrTransportadora(idx)"
                class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Remover"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

      </div>

      <!-- ══ ABA 3: Resíduo ════════════════════════════════════════════════════ -->
      <div v-show="abaAtiva === 3" class="space-y-6">

        <section>
          <div class="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-4">
            <Info class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p class="text-xs text-amber-700 dark:text-amber-300">
              Crie ou adicione um resíduo existente buscando pelo código interno ou código SINIR, e edite seus detalhes.
            </p>
          </div>

          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Identificação do Resíduo
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Código Interno – pesquisa -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Código Interno
              </label>
              <div class="relative" ref="refCodigoInterno">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="codigoInternoBusca"
                    type="text"
                    placeholder="Buscar por código interno..."
                    @focus="codigoInternoAberto = true"
                    @input="filtrarCodigoInterno"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <button
                    v-if="form.code"
                    type="button"
                    @click="limparCodigoInterno"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-if="codigoInternoAberto && codigosInternosFiltrados.length > 0"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="item in codigosInternosFiltrados"
                    :key="item.unique_id ?? item.id"
                    type="button"
                    @click="selecionarCodigoInterno(item)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Package class="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ item.code }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.description_resiudo ?? '—' }} · SINIR: {{ item.codigo_sinir ?? '—' }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Código SINIR -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Código no SINIR
              </label>
              <input
                v-model="form.codigo_sinir"
                type="text"
                placeholder="Ex: A001"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            <!-- Operação Diária -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Operação Diária
              </label>
              <input
                :value="formatDataExibicao(props.entradaDate)"
                type="text"
                readonly
                placeholder="—"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 cursor-not-allowed"
              />
            </div>

          </div>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Detalhes do Resíduo
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Descrição -->
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Descrição do Resíduo
              </label>
              <textarea
                v-model="form.description_resiudo"
                rows="3"
                placeholder="Descreva o resíduo..."
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
              />
            </div>

            <!-- Tipo de Resíduo -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tipo de Resíduo
              </label>
              <div class="relative" ref="refTipoResiduo">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="tipoResiduoBusca"
                    type="text"
                    placeholder="Buscar tipo de resíduo..."
                    @focus="tipoResiduoAberto = true"
                    @input="filtrarTiposResiduo"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <button
                    v-if="form.residue_type"
                    type="button"
                    @click="limparTipoResiduo"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-if="tipoResiduoAberto && tiposResiduoFiltrados.length > 0"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="tipo in tiposResiduoFiltrados"
                    :key="tipo.id"
                    type="button"
                    @click="selecionarTipoResiduo(tipo)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FlaskConical class="w-4 h-4 text-slate-400 shrink-0" />
                    <p class="font-medium text-slate-900 dark:text-white">{{ tipo.name }}</p>
                  </button>
                </div>
                <p v-if="tipoResiduoAberto && tiposResiduoFiltrados.length === 0 && tipoResiduoBusca.length > 0" class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  Nenhum tipo de resíduo encontrado.
                </p>
              </div>
            </div>

            <!-- Classe -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Classe <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-3">
                <label
                  v-for="cls in ['Classe I', 'Classe II']"
                  :key="cls"
                  class="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors"
                  :class="form.class_code === cls
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'"
                >
                  <input
                    v-model="form.class_code"
                    type="radio"
                    :value="cls"
                    class="accent-primary"
                  />
                  <span class="text-sm font-medium" :class="form.class_code === cls ? 'text-primary' : 'text-slate-700 dark:text-slate-300'">
                    {{ cls }}
                  </span>
                </label>
              </div>
            </div>

            <!-- Quantidade em M³ -->
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Quantidade em M³ <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.volume_in_m3"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  required
                  class="w-full px-3 py-2.5 pr-12 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">m³</span>
              </div>
            </div>

          </div>
        </section>

      </div>

      <!-- ══ ABA 3: Gerador ══════════════════════════════════════════════════════ -->
      <div v-show="abaAtiva === 2" class="space-y-6">

        <section>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Informações do Gerador
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Nome Fantasia – pesquisa -->
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Nome (Nome Fantasia / Razão Social)
              </label>
              <div class="relative" ref="refGerador">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="geradorBusca"
                    type="text"
                    placeholder="Buscar gerador..."
                    @focus="geradorAberto = true"
                    @input="filtrarGeradores"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <button
                    v-if="geradorSelecionado"
                    type="button"
                    @click="limparGerador"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-if="geradorAberto && geradorFiltrados.length > 0"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="c in geradorFiltrados"
                    :key="c.id"
                    type="button"
                    @click="selecionarGerador(c)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Factory class="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ c.nome_fantasia }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ c.razao_social }} · CNPJ: {{ c.document ?? '—' }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- CNPJ – somente leitura após seleção -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                CNPJ
              </label>
              <input
                :value="geradorSelecionado?.document ?? ''"
                type="text"
                placeholder="Preenchido automaticamente"
                readonly
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 cursor-not-allowed"
              />
            </div>

            <!-- Código SINIR – somente leitura após seleção -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Código no SINIR
              </label>
              <input
                :value="geradorSelecionado?.codigo_sinir ?? ''"
                type="text"
                placeholder="Preenchido automaticamente"
                readonly
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 placeholder-slate-400 dark:placeholder-slate-500 cursor-not-allowed"
              />
            </div>

          </div>
        </section>

      </div>

      <!-- ══ ABA 5: Informações adicionais ══════════════════════════════════════ -->
      <div v-show="abaAtiva === 4" class="space-y-6">


        <section>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Parâmetros Físico-Químicos
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <!-- pH -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">pH</label>
              <input
                v-model.number="form.ph"
                type="number"
                step="0.01"
                min="0"
                max="14"
                placeholder="Ex: 7.0"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            <!-- Temperatura -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Temperatura</label>
              <div class="relative">
                <input
                  v-model.number="form.temperature"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 25.0"
                  class="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">°C</span>
              </div>
            </div>

            <!-- Condutividade -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Condutividade</label>
              <div class="relative">
                <input
                  v-model.number="form.conductivity"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 1.5"
                  class="w-full px-3 py-2.5 pr-16 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">mS/cm</span>
              </div>
            </div>

          </div>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Destinação e Responsável
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Lagoa de destinação -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Lagoa de Destinação
              </label>
              <div class="relative" ref="refLocal">
                <div class="relative">
                  <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="localBusca"
                    type="text"
                    placeholder="Buscar lagoa..."
                    @focus="localAberto = true"
                    @input="filtrarLocais"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <button
                    v-if="form.destiny_place"
                    type="button"
                    @click="limparLocal"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-if="localAberto && locaisFiltrados.length > 0"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="l in locaisFiltrados"
                    :key="l.id"
                    type="button"
                    @click="selecionarLocal(l)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MapPin class="w-4 h-4 text-slate-400 shrink-0" />
                    <p class="font-medium text-slate-900 dark:text-white">{{ l.name }}</p>
                  </button>
                </div>
              </div>
            </div>

            <!-- Operador que recebeu -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Operador que Recebeu
              </label>
              <div class="relative" ref="refOperador">
                <div class="relative">
                  <UserCheck class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    v-model="operadorBusca"
                    type="text"
                    placeholder="Buscar operador..."
                    @focus="operadorAberto = true"
                    @input="filtrarOperadores"
                    class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  />
                  <button
                    v-if="form.operador_que_recebeu"
                    type="button"
                    @click="limparOperador"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <div
                  v-if="operadorAberto && operadoresFiltrados.length > 0"
                  class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    v-for="op in operadoresFiltrados"
                    :key="op.id"
                    type="button"
                    @click="selecionarOperador(op)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <UserCheck class="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ op.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">CPF: {{ op.cpf ?? '—' }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Observações
          </h2>
          <textarea
            v-model="form.observation"
            rows="4"
            placeholder="Observações adicionais sobre esta entrada..."
            class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
          />
        </section>

      </div>

      <!-- ── Navegação entre abas + Ações ──────────────────────────────────── -->
      <div class="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 px-6 md:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          v-if="abaAtiva > 0"
          type="button"
          @click="abaAtiva--"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft class="w-4 h-4" />
          Anterior
        </button>
        <div v-else class="w-0" />

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="$emit('voltar')"
            class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            v-if="abaAtiva < abas.length - 1"
            type="button"
            @click="abaAtiva++"
            class="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft"
          >
            Próximo
            <ChevronRight class="w-4 h-4" />
          </button>

          <button
            v-else
            type="submit"
            :disabled="salvando"
            class="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Loader2 v-if="salvando" class="w-4 h-4 animate-spin" />
            {{ salvando ? 'Salvando...' : 'Salvar Entrada' }}
          </button>
        </div>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  ArrowLeft, Loader2, Search, X, Plus, Trash2, Info,
  FileText, Car, Truck, User, Building2, Package, FlaskConical,
  ChevronLeft, ChevronRight, SlidersHorizontal, MapPin, UserCheck, Factory,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { TransacaoListaDetalhe } from '~/types/transacaoListaDetalhe'
import type { Transportadora } from '~/types/transportadora'
import type { Veiculo } from '~/types/veiculo'
import type { Motorista } from '~/types/motorista'
import { useTiposResiduos } from '~/composables/useTiposResiduos'
import type { TipoResiduo } from '~/types/tipoResiduo'
import { useLocais } from '~/composables/useLocais'
import type { Local } from '~/types/local'
import { useOperadores } from '~/composables/useOperadores'
import type { Operador } from '~/types/operador'
import { useTransacoesListaDetalhe } from '~/composables/useTransacoesListaDetalhe'
import { useTransacoesListaEntrada } from '~/composables/useTransacoesListaEntrada'
import { useTransportadoras } from '~/composables/useTransportadoras'
import { useMotoristas } from '~/composables/useMotoristas'
import { useVeiculos } from '~/composables/useVeiculos'
import { useEmpresas } from '~/composables/useEmpresas'
import { useClientes } from '~/composables/useClientes'
import type { Cliente } from '~/types/cliente'
import { useTransacoesDocumento } from '~/composables/useTransacoesDocumento'
import { buscarManifestoSinir } from '~/api/sinir'
import { extrairNFdaObservacao } from '~/utils/sinirUtils'
import type { SinirManifesto } from '~/types/sinir'

// ── Props & Emits ─────────────────────────────────────────────────────────────

const props = defineProps<{
  isNovo: boolean
  entradaId?: string | null          // modo: adicionar detalhe a entrada existente
  entradaDate?: string | null        // data da entrada pai (exibição apenas)
  detalhe?: TransacaoListaDetalhe | null  // modo: editar detalhe existente
}>()
const emit = defineEmits<{ voltar: []; salvo: [] }>()

// ── Composables ───────────────────────────────────────────────────────────────

const supabase = useSupabaseClient()
const { detalhes, fetchDetalhes, createDetalhe, updateDetalhe, proximoDischargeNumber } = useTransacoesListaDetalhe()
const { createTransacao, incrementTotalRecebido } = useTransacoesListaEntrada()
const { getCompanyId, fetchEmpresaDoUsuario, empresa } = useEmpresas()
const { transportadoras, fetchTransportadoras, createTransportadora } = useTransportadoras()
const { motoristas, fetchMotoristas, createMotorista } = useMotoristas()
const { veiculos, fetchVeiculos, createVeiculo } = useVeiculos()
const { clientes, fetchClientes, createCliente } = useClientes()
const { tiposResiduos, fetchTiposResiduos } = useTiposResiduos()
const { locais, fetchLocais } = useLocais()
const { operadores, fetchOperadores } = useOperadores()
const { createDocumento, fetchDocumentoByDetalheId, updateDocumento } = useTransacoesDocumento()

// ── Estado das abas ────────────────────────────────────────────────────────────

const abaAtiva = ref(0)

const abas = computed(() => [
  { label: 'Documento', icone: FileText, erro: false },
  { label: 'Transportadora', icone: Building2, erro: false },
  { label: 'Gerador', icone: Factory, erro: false },
  { label: 'Resíduo', icone: Package, erro: false },
  { label: 'Inf. adicionais', icone: SlidersHorizontal, erro: false },
])

// ── Formulário principal ───────────────────────────────────────────────────────

const form = ref({
  // Aba 1 – Documento
  mtr: null as string | null,
  nota_fiscal: null as string | null,
  data_coleta: null as string | null,
  date: null as string | null,
  discharge_number: null as string | null,
  veiculo_plate: null as string | null,
  motorista_id: null as string | null,
  // Aba 2 – Transportadora
  carrier: null as string | null,
  mtrs_transportadora: [] as string[],
  // Aba 3 – Resíduo
  code: null as string | null,
  codigo_sinir: null as string | null,
  operacao_diaria: null as string | null,
  description_resiudo: null as string | null,
  residue_type: null as string | null,
  class_code: null as 'Classe I' | 'Classe II' | null,
  volume_in_m3: null as number | null,
  // Aba 4 – Informações adicionais
  ph: null as number | null,
  temperature: null as number | null,
  conductivity: null as number | null,
  destiny_place: null as string | null,
  operador_que_recebeu: null as string | null,
  observation: null as string | null,
})

// ── Estado de pesquisa — MTR Documento ────────────────────────────────────────

const mtrDocumentoBusca = ref('')
const mtrDocumentoAberto = ref(false)
const mtrDocumentosFiltrados = ref<TransacaoListaDetalhe[]>([])

function filtrarMtrsDocumento() {
  const q = mtrDocumentoBusca.value.toLowerCase()
  mtrDocumentosFiltrados.value = q.length < 2
    ? []
    : detalhes.value.filter(d => d.mtr?.toLowerCase().includes(q)).slice(0, 8)
}

function selecionarMtrDocumento(item: TransacaoListaDetalhe) {
  form.value.mtr = item.mtr ?? null
  mtrDocumentoBusca.value = item.mtr ?? ''
  mtrDocumentoAberto.value = false
}

// ── Estado de pesquisa — Veículo ──────────────────────────────────────────────

const veiculoBusca = ref('')
const veiculoAberto = ref(false)
const veiculosFiltrados = ref<Veiculo[]>([])

function filtrarVeiculos() {
  const q = veiculoBusca.value.toLowerCase()
  veiculosFiltrados.value = q.length < 1
    ? veiculos.value.slice(0, 8)
    : veiculos.value.filter(v =>
        v.plate?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q)
      ).slice(0, 8)
}

const veiculoSelecionado = ref<Veiculo | null>(null)

function selecionarVeiculo(v: Veiculo) {
  form.value.veiculo_plate = v.plate ?? null
  veiculoSelecionado.value = v
  veiculoBusca.value = v.plate ?? ''
  veiculoAberto.value = false
}

function limparVeiculo() {
  form.value.veiculo_plate = null
  veiculoSelecionado.value = null
  veiculoBusca.value = ''
}

// ── Estado de pesquisa — Motorista ────────────────────────────────────────────

const motoristaBusca = ref('')
const motoristaAberto = ref(false)
const motoristasFiltrados = ref<Motorista[]>([])

function filtrarMotoristas() {
  const q = motoristaBusca.value.toLowerCase()
  motoristasFiltrados.value = q.length < 1
    ? motoristas.value.slice(0, 8)
    : motoristas.value.filter(m =>
        m.name?.toLowerCase().includes(q) || m.cpf?.includes(q)
      ).slice(0, 8)
}

function selecionarMotorista(m: Motorista) {
  form.value.motorista_id = m.unique_id ?? null
  motoristaBusca.value = m.name ?? ''
  motoristaAberto.value = false
}

function limparMotorista() {
  form.value.motorista_id = null
  motoristaBusca.value = ''
}

// ── Estado de pesquisa — Transportadora ──────────────────────────────────────

const transportadoraBusca = ref('')
const transportadoraAberta = ref(false)
const transportadorasFiltradas = ref<Transportadora[]>([])
const transportadoraSelecionada = ref<Transportadora | null>(null)

function filtrarTransportadoras() {
  const q = transportadoraBusca.value.toLowerCase()
  transportadorasFiltradas.value = q.length < 1
    ? transportadoras.value.slice(0, 8)
    : transportadoras.value.filter(t =>
        t.nome_fantasia?.toLowerCase().includes(q) ||
        t.razao_social?.toLowerCase().includes(q) ||
        t.cnpj?.includes(q)
      ).slice(0, 8)
}

function selecionarTransportadora(t: Transportadora) {
  form.value.carrier = t.unique_id ?? null
  transportadoraBusca.value = t.nome_fantasia ?? ''
  transportadoraSelecionada.value = t
  transportadoraAberta.value = false
}

function limparTransportadora() {
  form.value.carrier = null
  transportadoraBusca.value = ''
  transportadoraSelecionada.value = null
}

// ── Estado de pesquisa — Gerador ─────────────────────────────────────────────

const geradorBusca = ref('')
const geradorAberto = ref(false)
const geradorFiltrados = ref<Cliente[]>([])

function filtrarGeradores() {
  const q = geradorBusca.value.toLowerCase()
  geradorFiltrados.value = q.length < 1
    ? clientes.value.slice(0, 8)
    : clientes.value.filter(c =>
        c.nome_fantasia?.toLowerCase().includes(q) ||
        c.razao_social?.toLowerCase().includes(q) ||
        c.document?.includes(q)
      ).slice(0, 8)
}

function selecionarGerador(c: Cliente) {
  geradorSelecionado.value = c
  geradorBusca.value = c.nome_fantasia ?? ''
  geradorAberto.value = false
}

function limparGerador() {
  geradorSelecionado.value = null
  geradorBusca.value = ''
}

// ── MTR(s) da transportadora ──────────────────────────────────────────────────

function adicionarMtrTransportadora() {
  form.value.mtrs_transportadora.push('')
}

function removerMtrTransportadora(idx: number) {
  form.value.mtrs_transportadora.splice(idx, 1)
}

// ── Estado de pesquisa — Código Interno ───────────────────────────────────────

const codigoInternoBusca = ref('')
const codigoInternoAberto = ref(false)
const codigosInternosFiltrados = ref<TransacaoListaDetalhe[]>([])

function filtrarCodigoInterno() {
  const q = codigoInternoBusca.value.toLowerCase()
  codigosInternosFiltrados.value = q.length < 1
    ? []
    : detalhes.value
        .filter(d => d.code && d.code.toLowerCase().includes(q))
        .reduce<TransacaoListaDetalhe[]>((acc, d) => {
          if (!acc.find(x => x.code === d.code)) acc.push(d)
          return acc
        }, [])
        .slice(0, 8)
}

function selecionarCodigoInterno(item: TransacaoListaDetalhe) {
  form.value.code = item.code ?? null
  form.value.codigo_sinir = item.codigo_sinir ?? null
  form.value.description_resiudo = item.description_resiudo ?? null
  form.value.class_code = item.class_code ?? null
  codigoInternoBusca.value = item.code ?? ''
  codigoInternoAberto.value = false
}

function limparCodigoInterno() {
  form.value.code = null
  codigoInternoBusca.value = ''
}

// ── Estado de pesquisa — Tipo de Resíduo ─────────────────────────────────────
// TODO: substituir por useTiposResiduos quando o composable for implementado

const tipoResiduoBusca = ref('')
const tipoResiduoAberto = ref(false)
const tiposResiduoFiltrados = ref<TipoResiduo[]>([])

function filtrarTiposResiduo() {
  const q = tipoResiduoBusca.value.toLowerCase()
  tiposResiduoFiltrados.value = q.length < 1
    ? tiposResiduos.value.slice(0, 8)
    : tiposResiduos.value.filter(t =>
        t.name?.toLowerCase().includes(q)
      ).slice(0, 8)
}

function selecionarTipoResiduo(tipo: TipoResiduo) {
  form.value.residue_type = tipo.unique_id ?? null
  tipoResiduoBusca.value = tipo.name ?? ''
  tipoResiduoAberto.value = false
}

function limparTipoResiduo() {
  form.value.residue_type = null
  tipoResiduoBusca.value = ''
}

// ── Estado de pesquisa — Local (Lagoa de destinação) ─────────────────────────

const localBusca = ref('')
const localAberto = ref(false)
const locaisFiltrados = ref<Local[]>([])

function filtrarLocais() {
  const q = localBusca.value.toLowerCase()
  locaisFiltrados.value = q.length < 1
    ? locais.value.slice(0, 8)
    : locais.value.filter(l => l.name?.toLowerCase().includes(q)).slice(0, 8)
}

function selecionarLocal(l: Local) {
  form.value.destiny_place = l.unique_id ?? null
  localBusca.value = l.name ?? ''
  localAberto.value = false
}

function limparLocal() {
  form.value.destiny_place = null
  localBusca.value = ''
}

// ── Estado de pesquisa — Operador ─────────────────────────────────────────────

const operadorBusca = ref('')
const operadorAberto = ref(false)
const operadoresFiltrados = ref<Operador[]>([])

function filtrarOperadores() {
  const q = operadorBusca.value.toLowerCase()
  operadoresFiltrados.value = q.length < 1
    ? operadores.value.slice(0, 8)
    : operadores.value.filter(op =>
        op.name?.toLowerCase().includes(q) || op.cpf?.includes(q)
      ).slice(0, 8)
}

function selecionarOperador(op: Operador) {
  form.value.operador_que_recebeu = op.unique_id ?? null
  operadorBusca.value = op.name ?? ''
  operadorAberto.value = false
}

function limparOperador() {
  form.value.operador_que_recebeu = null
  operadorBusca.value = ''
}

// ── Fechar dropdowns ao clicar fora ──────────────────────────────────────────

const refMtrDocumento = ref<HTMLElement | null>(null)
const refVeiculo = ref<HTMLElement | null>(null)
const refMotorista = ref<HTMLElement | null>(null)
const refTransportadora = ref<HTMLElement | null>(null)
const refCodigoInterno = ref<HTMLElement | null>(null)
const refTipoResiduo = ref<HTMLElement | null>(null)
const refLocal = ref<HTMLElement | null>(null)
const refOperador = ref<HTMLElement | null>(null)
const refGerador = ref<HTMLElement | null>(null)

function fecharDropdowns(e: MouseEvent) {
  const target = e.target as Node
  if (!refMtrDocumento.value?.contains(target)) mtrDocumentoAberto.value = false
  if (!refVeiculo.value?.contains(target)) veiculoAberto.value = false
  if (!refMotorista.value?.contains(target)) motoristaAberto.value = false
  if (!refTransportadora.value?.contains(target)) transportadoraAberta.value = false
  if (!refCodigoInterno.value?.contains(target)) codigoInternoAberto.value = false
  if (!refTipoResiduo.value?.contains(target)) tipoResiduoAberto.value = false
  if (!refLocal.value?.contains(target)) localAberto.value = false
  if (!refOperador.value?.contains(target)) operadorAberto.value = false
  if (!refGerador.value?.contains(target)) geradorAberto.value = false
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

const salvando = ref(false)
const buscandoMtr = ref(false)
const geradorSelecionado = ref<Cliente | null>(null)
const documentoEditandoId = ref<string | null>(null)

// ── Utilidades SINIR ──────────────────────────────────────────────────────────

function formatDataExibicao(date: string | null | undefined): string {
  if (!date) return ''
  const d = date.substring(0, 10)
  const [year, month, day] = d.split('-')
  if (!year || !month || !day) return date
  return `${day}/${month}/${year}`
}

function tsToDateStr(ts: number | null): string | null {
  if (!ts) return null
  return new Date(ts).toISOString().split('T')[0] ?? null
}

function mapClasse(claDescricao: string | null): 'Classe I' | 'Classe II' | null {
  if (!claDescricao) return null
  const upper = claDescricao.toUpperCase()
  if (upper.includes('II')) return 'Classe II'
  if (upper.includes('I')) return 'Classe I'
  return null
}

async function buscarNoSinir(mtr: string) {
  if (mtr.replace(/\D/g, '').length < 8) return
  buscandoMtr.value = true
  mtrDocumentoAberto.value = false

  try {
    await fetchEmpresaDoUsuario()
    const e = empresa.value

    if (!e?.cpf_cnpj || !e?.senha || !e?.unidade) {
      toast.error('Credenciais SINIR não configuradas', {
        description: 'Configure cpf_cnpj, senha e unidade na empresa.',
      })
      return
    }

    const resultado = await buscarManifestoSinir(mtr, {
      cpf_cnpj: e.cpf_cnpj,
      senha: e.senha,
      unidade: e.unidade,
    })

    if (!resultado?.objetoResposta) {
      toast.error('MTR não encontrado', { description: `Nenhum manifesto para o MTR ${mtr}.` })
      return
    }

    await preencherDoManifesto(resultado.objetoResposta)
    toast.success('MTR preenchido', { description: `Dados do MTR ${mtr} carregados automaticamente.` })

  } catch (err: any) {
    toast.error('Erro ao buscar no SINIR', {
      description: err?.data?.message ?? err?.message ?? 'Falha na comunicação.',
    })
  } finally {
    buscandoMtr.value = false
  }
}

async function preencherDoManifesto(manifesto: SinirManifesto) {
  const company = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  // Campos básicos
  form.value.mtr = manifesto.manNumero
  mtrDocumentoBusca.value = manifesto.manNumero
  form.value.data_coleta = tsToDateStr(manifesto.manData)
  form.value.date = tsToDateStr(manifesto.manDataExpedicao)
  form.value.nota_fiscal = extrairNFdaObservacao(manifesto.manObservacao)

  // Veículo
  if (manifesto.manPlacaVeiculo) {
    const placa = manifesto.manPlacaVeiculo.replace(/[\s-]/g, '').toUpperCase()
    let veiculo = veiculos.value.find(v => v.plate?.replace(/[\s-]/g, '').toUpperCase() === placa)

    if (!veiculo) {
      const res = await createVeiculo({
        unique_id: `veiculo_${Date.now()}`,
        plate: placa,
        model: null,
        vehicle_type: null,
        capacity_in_cubic_meters: null,
        vehicle_list: null,
        creator: null,
        company,
        user_id: userId,
      })
      if (res?.success) veiculo = res.data as Veiculo
    }
    if (veiculo) selecionarVeiculo(veiculo)
  }

  // Motorista
  if (manifesto.manNomeMotorista) {
    const nome = manifesto.manNomeMotorista.trim()
    let motorista = motoristas.value.find(m => m.name?.toLowerCase() === nome.toLowerCase())

    if (!motorista) {
      const res = await createMotorista({
        unique_id: `motorista_${Date.now()}`,
        name: nome,
        cpf: null,
        company,
        user_id: userId,
        partner_company_driver_list: null,
        transportadora: null,
      })
      if (res?.success) motorista = res.data as Motorista
    }
    if (motorista) selecionarMotorista(motorista)
  }

  // Transportadora
  const transp = manifesto.parceiroTransportador
  if (transp.parCodigo || transp.parCnpj) {
    const codigoStr = transp.parCodigo?.toString() ?? null
    let t = transportadoras.value.find(t =>
      (codigoStr && t.codigo_sinir === codigoStr) ||
      (transp.parCnpj && t.cnpj === transp.parCnpj)
    )
    if (!t) {
      const res = await createTransportadora({
        unique_id: `transportadora_${Date.now()}`,
        nome_fantasia: transp.parDescricao,
        razao_social: transp.parDescricao,
        cnpj: transp.parCnpj,
        codigo_sinir: codigoStr,
        company,
        user_id: userId,
        drivers: null, email: null, phone: null, type: null, Creator: null, contato: null,
      })
      if (res?.success) t = res.data as Transportadora
    }
    if (t) selecionarTransportadora(t)
  }

  // Gerador → clientes
  const gerador = manifesto.parceiroGerador
  if (gerador.parCodigo || gerador.parCnpj) {
    const codigoStr = gerador.parCodigo?.toString() ?? null
    let cliente = clientes.value.find(c =>
      (codigoStr && c.codigo_sinir === codigoStr) ||
      (gerador.parCnpj && c.document === gerador.parCnpj)
    )
    if (!cliente) {
      const res = await createCliente({
        unique_id: `cliente_${Date.now()}`,
        nome_fantasia: gerador.parDescricao,
        razao_social: gerador.parDescricao,
        document: gerador.parCnpj,
        codigo_sinir: codigoStr,
        company,
        user_id: userId,
        address: null, client_list: null, contacts: null, date_of_birth: null,
        email: null, gender: null, image: null, mtrs: null, nature: null,
        phone_number: null, user_responsible: null, creator: null,
      })
      if (res?.success) cliente = res.data as Cliente
    }
    geradorSelecionado.value = cliente ?? null
  }

  // Resíduo (primeiro da lista)
  const residuoItem = manifesto.listaManifestoResiduo?.[0]
  if (residuoItem) {
    form.value.codigo_sinir = residuoItem.residuo.resCodigoIbama
    form.value.description_resiudo = residuoItem.residuo.resDescricao
    form.value.class_code = mapClasse(residuoItem.classe.claDescricao)
    form.value.volume_in_m3 = residuoItem.marQuantidade
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', fecharDropdowns)

  // Carrega todos os dados necessários antes de popular o form
  await Promise.all([
    fetchDetalhes(),
    fetchTransportadoras(),
    fetchMotoristas(),
    fetchVeiculos(),
    fetchClientes(),
    fetchTiposResiduos(),
    fetchLocais(),
    fetchOperadores(),
  ])

  // Modo adicionar detalhe: preenche o número de descarga sequencial
  if (props.isNovo && props.entradaId) {
    form.value.discharge_number = await proximoDischargeNumber(props.entradaId)
  }

  // Modo edição: busca o documento vinculado e popula o form
  if (!props.isNovo && props.detalhe) {
    const docRes = props.detalhe.unique_id
      ? await fetchDocumentoByDetalheId(props.detalhe.unique_id)
      : null
    if (docRes?.data) documentoEditandoId.value = docRes.data.id
    popularFormDoDetalhe(props.detalhe, docRes?.data ?? null)
  }
})

function popularFormDoDetalhe(d: TransacaoListaDetalhe, doc: import('~/types/transacaoDocumento').TransacaoDocumento | null) {
  // ── Aba 1 – Documento ────────────────────────────────────────────────────
  form.value.mtr = doc?.manifest_number ?? d.mtr ?? null
  mtrDocumentoBusca.value = form.value.mtr ?? ''
  form.value.nota_fiscal = doc?.nota_fiscal ?? d.nota_fiscal ?? null
  form.value.discharge_number = d.discharge_number ?? doc?.discharge_number ?? null
  form.value.operacao_diaria = null // campo separado — sem FK no documento

  // Datas: preferência ao documento (tem timestamps), fallback para o detalhe
  const coleta = doc?.collection_date ?? d.date ?? null
  const recebimento = doc?.receipt_date ?? d.date ?? null
  form.value.data_coleta = coleta ? coleta.substring(0, 10) : null
  form.value.date = recebimento ? recebimento.substring(0, 10) : null

  // Veículo
  if (doc?.vehicle) {
    const v = veiculos.value.find(v => v.unique_id === doc.vehicle)
    if (v) selecionarVeiculo(v)
  }

  // Motorista
  if (doc?.driver) {
    const m = motoristas.value.find(m => m.unique_id === doc.driver)
    if (m) selecionarMotorista(m)
  }

  // ── Aba 2 – Transportadora ───────────────────────────────────────────────
  const carrierId = d.carrier ?? doc?.carrier ?? null
  if (carrierId) {
    const t = transportadoras.value.find(t => t.unique_id === carrierId)
    if (t) selecionarTransportadora(t)
  }
  const mtrs = doc?.mtrs_transportadora ?? d.mtrs_transportadora
  if (Array.isArray(mtrs) && mtrs.length > 0) {
    form.value.mtrs_transportadora = mtrs.map(String)
  } else if (typeof mtrs === 'string') {
    try { form.value.mtrs_transportadora = JSON.parse(mtrs) } catch { /* ignore */ }
  }

  // ── Aba 3 – Resíduo ──────────────────────────────────────────────────────
  form.value.code = d.code ?? null
  codigoInternoBusca.value = d.code ?? ''
  form.value.codigo_sinir = d.codigo_sinir ?? null
  form.value.description_resiudo = d.description_resiudo ?? doc?.residue_description ?? null
  form.value.class_code = d.class_code ?? (doc?.residue_class_code as 'Classe I' | 'Classe II' | null) ?? null
  form.value.volume_in_m3 = d.volume_in_m3 ?? doc?.volume ?? null
  const residueTypeId = d.residue_type ?? doc?.residue_type ?? null
  if (residueTypeId) {
    const tipo = tiposResiduos.value.find(t => t.unique_id === residueTypeId)
    if (tipo) selecionarTipoResiduo(tipo)
  }

  // ── Aba 4 – Gerador ──────────────────────────────────────────────────────
  const generatorId = doc?.generator ?? null
  if (generatorId) {
    const c = clientes.value.find(c => c.unique_id === generatorId)
    if (c) selecionarGerador(c)
  }

  // ── Aba 5 – Informações adicionais ──────────────────────────────────────
  form.value.ph = d.ph ?? null
  form.value.temperature = d.temperature ?? null
  form.value.conductivity = d.conductivity ?? null
  form.value.observation = d.observation ?? null
  if (d.destiny_place) {
    const local = locais.value.find(l => l.unique_id === d.destiny_place)
    if (local) selecionarLocal(local)
  }
  if (d.operador_que_recebeu) {
    const op = operadores.value.find(op => op.unique_id === d.operador_que_recebeu)
    if (op) selecionarOperador(op)
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', fecharDropdowns)
})

// ── Save ──────────────────────────────────────────────────────────────────────

async function salvar() {
  if (salvando.value) return
  salvando.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null
    const company = await getCompanyId()
    const now = new Date().toISOString()
    const detalheUniqueId = `detalhe_${Date.now()}`

    // ── MODO EDIÇÃO ──────────────────────────────────────────────────────────
    if (!props.isNovo && props.detalhe) {
      const oldVolume = props.detalhe.volume_in_m3 ?? 0
      const newVolume = form.value.volume_in_m3 ?? 0

      const updateResult = await updateDetalhe(props.detalhe.id, {
        date: form.value.data_coleta ?? form.value.date,
        discharge_number: form.value.discharge_number,
        carrier: form.value.carrier,
        code: form.value.code,
        codigo_sinir: form.value.codigo_sinir,
        description_resiudo: form.value.description_resiudo,
        residue_type: form.value.residue_type,
        class_code: form.value.class_code,
        volume_in_m3: newVolume,
        ph: form.value.ph,
        temperature: form.value.temperature,
        conductivity: form.value.conductivity,
        destiny_place: form.value.destiny_place,
        operador_que_recebeu: form.value.operador_que_recebeu,
        observation: form.value.observation,
      })

      if (!updateResult?.success) {
        toast.error('Erro ao atualizar', { description: updateResult?.error ?? 'Tente novamente.' })
        return
      }

      // Ajusta total_recebido com a diferença de volume
      const delta = newVolume - oldVolume
      if (delta !== 0 && props.detalhe.residue_operation) {
        await incrementTotalRecebido(props.detalhe.residue_operation, delta)
      }

      // Atualiza ou cria o documento vinculado (MTR, NF, transportadora, veículo, etc.)
      const docPayload = {
        carrier: form.value.carrier,
        driver: form.value.motorista_id,
        generator: geradorSelecionado.value?.unique_id ?? null,
        vehicle: veiculoSelecionado.value?.unique_id ?? null,
        residue_type: form.value.residue_type,
        residue_class_code: form.value.class_code,
        collection_date: form.value.data_coleta ? new Date(form.value.data_coleta).toISOString() : null,
        receipt_date: form.value.date ? new Date(form.value.date).toISOString() : null,
        discharge_number: form.value.discharge_number,
        manifest_number: form.value.mtr,
        nota_fiscal: form.value.nota_fiscal,
        residue_description: form.value.description_resiudo,
        volume: form.value.volume_in_m3,
        mtrs_transportadora: form.value.mtrs_transportadora.filter(Boolean).length
          ? form.value.mtrs_transportadora.filter(Boolean)
          : null,
      }

      if (documentoEditandoId.value) {
        const docResult = await updateDocumento(documentoEditandoId.value, docPayload)
        if (!docResult?.success) {
          toast.error('Erro ao atualizar documento', { description: docResult?.error ?? 'Tente novamente.' })
          return
        }
      } else if (props.detalhe?.unique_id) {
        // Detalhe sem documento vinculado (registro antigo) — cria agora
        await createDocumento({
          unique_id: `doc_${Date.now()}`,
          user_id: userId,
          company,
          residue: props.detalhe.unique_id,
          mtr_transportadora_old: null,
          ...docPayload,
        })
      }

      toast.success('Detalhe atualizado!', { description: 'As alterações foram salvas com sucesso.' })
      emit('salvo')
      emit('voltar')
      return
    }

    // ── MODO CRIAÇÃO ─────────────────────────────────────────────────────────

    // Usa a entrada existente (modo detalhe) ou cria uma nova
    let residueOperation = props.entradaId ?? null

    if (!residueOperation) {
      // Modo: Nova Entrada — cria o cabeçalho primeiro
      const entradaUniqueId = `entrada_${Date.now()}`
      const entradaResult = await createTransacao({
        unique_id: entradaUniqueId,
        user_id: userId,
        company,
        date: form.value.date ?? (now.split('T')[0] ?? null),
        date_text: form.value.date ?? (now.split('T')[0] ?? null),
        transaction_type: 'Entrada',
        total_recebido: form.value.volume_in_m3,
        volume_descartado_vala: null,
        blend_destinado: null,
        creator: userId,
      })

      if (!entradaResult?.success) {
        toast.error('Erro ao criar entrada', { description: entradaResult?.error ?? 'Tente novamente.' })
        return
      }
      residueOperation = entradaUniqueId
    }

    // Cria o detalhe vinculado à entrada
    const detalheResult = await createDetalhe({
      unique_id: detalheUniqueId,
      user_id: userId,
      company,
      residue_operation: residueOperation,
      transaction_type: 'Entrada',
      date: form.value.data_coleta ?? form.value.date,
      discharge_number: form.value.discharge_number,
      carrier: form.value.carrier,
      code: form.value.code,
      codigo_sinir: form.value.codigo_sinir,
      description_resiudo: form.value.description_resiudo,
      residue_type: form.value.residue_type,
      class_code: form.value.class_code,
      volume_in_m3: form.value.volume_in_m3,
      destiny_place: form.value.destiny_place,
      operador_que_recebeu: form.value.operador_que_recebeu,
      blend_destinado_checking: null,
      observation: form.value.observation,
      origin_place: null,
      conductivity: form.value.conductivity,
      ph: form.value.ph,
      temperature: form.value.temperature,
    })

    if (!detalheResult?.success) {
      toast.error('Erro ao salvar detalhe', { description: detalheResult?.error ?? 'Tente novamente.' })
      return
    }

    // Incrementa o total_recebido na entrada
    if (form.value.volume_in_m3 && residueOperation) {
      await incrementTotalRecebido(residueOperation, form.value.volume_in_m3)
    }

    // Cria o documento vinculado ao detalhe
    await createDocumento({
      unique_id: `doc_${Date.now()}`,
      user_id: userId,
      company,
      carrier: form.value.carrier,
      driver: form.value.motorista_id,
      generator: geradorSelecionado.value?.unique_id ?? null,
      residue: detalheUniqueId,
      residue_type: form.value.residue_type,
      vehicle: veiculoSelecionado.value?.unique_id ?? null,
      residue_class_code: form.value.class_code,
      collection_date: form.value.data_coleta ? new Date(form.value.data_coleta).toISOString() : null,
      receipt_date: form.value.date ? new Date(form.value.date).toISOString() : null,
      discharge_number: form.value.discharge_number,
      manifest_number: form.value.mtr,
      nota_fiscal: form.value.nota_fiscal,
      residue_description: form.value.description_resiudo,
      volume: form.value.volume_in_m3,
      mtrs_transportadora: form.value.mtrs_transportadora.filter(Boolean).length
        ? form.value.mtrs_transportadora.filter(Boolean)
        : null,
      mtr_transportadora_old: null,
    })

    toast.success(props.entradaId ? 'Detalhe adicionado!' : 'Entrada registrada!', {
      description: props.entradaId
        ? 'O resíduo foi adicionado à entrada com sucesso.'
        : 'A entrada de resíduo foi salva com sucesso.',
    })
    emit('salvo')
    emit('voltar')

  } catch (err: any) {
    toast.error('Erro inesperado', { description: err.message ?? 'Falha na comunicação com o servidor.' })
  } finally {
    salvando.value = false
  }
}
</script>
