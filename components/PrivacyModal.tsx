import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@clerk/clerk-expo';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PrivacyModalProps = {
    visible: boolean;
    onClose: () => void;
};

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ visible, onClose }) => {
    const { colors } = useTheme();
    const { user } = useUser();

    const lastUpdateDate = '30 de Maio de 2025';
    const contactEmail = 'app.faxinex.faculdade@gmail.com';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <SafeAreaView style={[styles.safeAreaModal, { backgroundColor: colors.background }]}>
                    <View style={styles.modalView}>
                        <ScrollView style={styles.scrollViewContent} contentContainerStyle={styles.contentContainer}>
                            <Text style={[styles.pageTitle, { color: colors.text }]}>Política de Privacidade do Aplicativo Faxinex</Text>
                            <Text style={[styles.lastUpdated, { color: colors.text }]}>Última atualização: {lastUpdateDate}</Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>
                                Olá {user?.firstName}.
                            </Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Bem-vindo(a) ao Faxinex, operado pela Faxinex. Esta Política de Privacidade descreve como coletamos, usamos, divulgamos e protegemos suas informações pessoais quando você utiliza nosso Aplicativo.
                            </Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Ao utilizar o Aplicativo, você concorda com a coleta e uso de informações de acordo com esta política.
                            </Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>1. Informações que Coletamos</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Coletamos informações para fornecer e melhorar nosso Aplicativo para você. Os tipos de informações que coletamos são:
                            </Text>

                            <Text style={[styles.heading2, { color: colors.text }]}>a) Informações Fornecidas Diretamente por Você:</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Dados de Cadastro e Login:</Text> Quando você cria uma conta em nosso Aplicativo, coletamos as informações necessárias para seu cadastro e login, que incluem seu nome e endereço de e-mail, e uma senha criada por você para acesso à sua conta.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Foto de Perfil (Opcional):</Text> Você tem a opção de nos fornecer uma foto para o seu perfil de usuário. O fornecimento desta informação é totalmente voluntário.
                            </Text>

                            <Text style={[styles.heading2, { color: colors.text }]}>b) Informações Coletadas Automaticamente:</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Dados de Uso:</Text> Podemos coletar informações sobre como você acessa e usa o Aplicativo, como os recursos que você utiliza, as telas que você visita, as ações que você realiza, o tempo, a frequência e a duração de suas atividades dentro do Aplicativo.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Dados do Dispositivo:</Text> Podemos coletar informações sobre o dispositivo móvel que você usa para acessar o Aplicativo, incluindo o modelo do hardware, sistema operacional e versão, identificadores únicos de dispositivo (como IDFA no iOS ou Android ID), endereço IP, informações de rede móvel e informações sobre o desempenho do Aplicativo.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Dados de Localização (se aplicável e com sua permissão):</Text> Se o nosso Aplicativo oferecer funcionalidades baseadas em localização, poderemos coletar informações sobre sua localização aproximada ou precisa, mas apenas se você nos conceder permissão para isso através das configurações do seu dispositivo ou do Aplicativo. Você pode gerenciar suas preferências de localização nas configurações do seu dispositivo.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Cookies e Tecnologias Semelhantes:</Text> Podemos usar cookies (pequenos arquivos de texto armazenados no seu dispositivo) e tecnologias de rastreamento semelhantes para manter sua sessão de login, lembrar suas preferências e entender como você usa nosso Aplicativo.
                            </Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>2. Como Usamos Suas Informações</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Utilizamos as informações que coletamos para os seguintes propósitos:
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Fornecer e Manter o Aplicativo:</Text> Para operar e manter nosso Aplicativo, incluindo o gerenciamento da sua conta e o acesso às funcionalidades.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Personalizar sua Experiência:</Text> Para entender suas necessidades e preferências e personalizar sua experiência no Aplicativo (por exemplo, exibindo sua foto de perfil, se fornecida).
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Comunicação:</Text> Para nos comunicarmos com você sobre sua conta, atualizações do Aplicativo, alterações em nossas políticas, responder a seus pedidos de suporte e enviar informações importantes.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Melhorar o Aplicativo:</Text> Para entender como os usuários interagem com nosso Aplicativo, identificar tendências de uso, diagnosticar problemas técnicos e melhorar a funcionalidade e a usabilidade do Aplicativo.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Segurança:</Text> Para proteger a segurança e a integridade do nosso Aplicativo, prevenir fraudes e garantir o cumprimento dos nossos Termos de Serviço.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Obrigações Legais:</Text> Para cumprir com obrigações legais aplicáveis, solicitações de autoridades governamentais ou processos judiciais.
                            </Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>3. Como Compartilhamos Suas Informações</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Não compartilhamos suas informações pessoais com terceiros, exceto nas seguintes circunstâncias:
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Prestadores de Serviços:</Text> Podemos compartilhar suas informações com empresas terceirizadas e indivíduos que prestam serviços em nosso nome ou nos ajudam a analisar como nosso Aplicativo é usado (por exemplo, provedores de hospedagem, análise de dados, suporte ao cliente). Esses terceiros têm acesso às suas informações pessoais apenas para realizar essas tarefas em nosso nome e são obrigados a não divulgá-las ou usá-las para qualquer outra finalidade.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Por Razões Legais:</Text> Podemos divulgar suas informações se acreditarmos de boa fé que tal ação é necessária para: Cumprir uma obrigação legal; Proteger e defender os direitos ou propriedade da Faxinex; Prevenir ou investigar possíveis irregularidades relacionadas ao Aplicativo; Proteger a segurança pessoal dos usuários do Aplicativo ou do público; Proteger contra responsabilidade legal.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Transferência de Negócios:</Text> Se a Faxinex estiver envolvida em uma fusão, aquisição ou venda de ativos, suas informações pessoais poderão ser transferidas. Notificaremos você antes que suas informações pessoais sejam transferidas e se tornem sujeitas a uma Política de Privacidade diferente.
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                <Text style={[styles.bold, { color: colors.text }]}>Com Seu Consentimento:</Text> Podemos divulgar suas informações pessoais para qualquer outra finalidade com o seu consentimento explícito.
                            </Text>
                            <Text style={[styles.paragraphBold, { color: colors.text }]}>Não vendemos suas informações pessoais.</Text>


                            <Text style={[styles.heading1, { color: colors.text }]}>4. Retenção de Dados</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Reteremos suas informações pessoais apenas pelo tempo necessário para os fins estabelecidos nesta Política de Privacidade. Reteremos e usaremos suas informações na medida necessária para cumprir nossas obrigações legais (por exemplo, se formos obrigados a reter seus dados para cumprir as leis aplicáveis), resolver disputas e fazer cumprir nossos acordos e políticas legais.
                            </Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Os dados de uso geralmente são retidos por um período mais curto, exceto quando esses dados são usados para fortalecer a segurança ou melhorar a funcionalidade do nosso Aplicativo, ou se formos legalmente obrigados a reter esses dados por períodos mais longos.
                            </Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>5. Seus Direitos de Privacidade (LGPD)</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                De acordo com a Lei Geral de Proteção de Dados Pessoais (LGPD) e outras leis aplicáveis, você tem certos direitos em relação às suas informações pessoais. Estes podem incluir o direito de:
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Confirmar a existência de tratamento de seus dados.</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Acessar suas informações pessoais.</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Corrigir informações incompletas, inexatas ou desatualizadas.</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Anonimizar, bloquear ou eliminar dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Solicitar a portabilidade dos seus dados a outro fornecedor de serviço ou produto, mediante requisição expressa.</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Eliminar os dados pessoais tratados com o seu consentimento, exceto nas hipóteses de conservação legalmente permitidas.</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Obter informação sobre as entidades públicas e privadas com as quais realizamos uso compartilhado de dados.</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Obter informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa.</Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>• Revogar o consentimento a qualquer momento.</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Para exercer esses direitos, entre em contato conosco através do e-mail: <Text style={[styles.placeholder, { color: colors.text }]}>{contactEmail}</Text>
                            </Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>6. Segurança de Dados</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                A segurança de suas informações é importante para nós. Empregamos medidas de segurança administrativa, técnica e física razoáveis, projetadas para proteger as informações pessoais que coletamos contra perda, roubo e uso, divulgação ou modificação não autorizados. No entanto, lembre-se de que nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro. Embora nos esforcemos para usar meios comercialmente aceitáveis para proteger suas informações pessoais, não podemos garantir sua segurança absoluta.
                            </Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>7. Privacidade Infantil</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Nosso Aplicativo não se destina a menores de 13 anos (ou a idade mínima aplicável em sua jurisdição). Não coletamos intencionalmente informações de identificação pessoal de crianças menores dessa idade. Se você é pai ou responsável e sabe que seu filho nos forneceu informações pessoais, entre em contato conosco. Se tomarmos conhecimento de que coletamos informações pessoais de crianças sem verificação do consentimento dos pais, tomaremos medidas para remover essas informações de nossos servidores.
                            </Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>8. Alterações a Esta Política de Privacidade</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página e atualizando a data da "Última atualização" no topo desta Política de Privacidade.
                            </Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Recomendamos que você revise esta Política de Privacidade periodicamente para quaisquer alterações. As alterações a esta Política de Privacidade entram em vigor quando são publicadas nesta página.
                            </Text>

                            <Text style={[styles.heading1, { color: colors.text }]}>9. Entre em Contato</Text>
                            <Text style={[styles.paragraph, { color: colors.text }]}>
                                Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco:
                            </Text>
                            <Text style={[styles.listItem, { color: colors.text }]}>
                                • Por e-mail: <Text style={[styles.placeholder, { color: colors.text }]}>{contactEmail}</Text>
                            </Text>
                        </ScrollView>

                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.primary }]} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(54, 54, 54, 0.6)',
    },
    safeAreaModal: {
        width: '70%',
        maxHeight: '75%',
        borderRadius: 15,
        overflow: 'hidden',
    },
    modalView: {
        flex: 1,
        borderRadius: 15,
        paddingTop: 20,

        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    scrollViewContent: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    lastUpdated: {
        fontSize: 11,
        fontStyle: 'italic',
        marginBottom: 15,
        textAlign: 'center',
    },
    heading1: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 8,
    },
    heading2: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 5,
    },
    paragraph: {
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'justify',
        marginBottom: 10,
    },
    paragraphBold: {
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'justify',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    listItem: {
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'justify',
        marginBottom: 8,
    },
    bold: {
        fontWeight: 'bold',
    },
    placeholder: {
        color: 'red',
        fontWeight: 'bold',
    },
    closeButton: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignSelf: 'center',
        marginVertical: 15,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    }
});