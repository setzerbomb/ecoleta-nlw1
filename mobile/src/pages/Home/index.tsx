import React, { useEffect, useState } from "react";
import { Feather as Icon } from "@expo/vector-icons";
import { ImageBackground, StyleSheet, View, Image, Text } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import axios from "axios";

import logo from "../../assets/logo.png";
import background from "../../assets/home-background.png";

interface IBGE {
  sigla: string;
  nome: string;
}

const Home: React.FC = () => {
  const [estados, setEstados] = useState<IBGE[]>([] as IBGE[]);
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("");

  const navigation = useNavigation();

  function handleNavigateToPoints() {
    navigation.navigate("Points", {
      uf: selectedEstado,
      city: selectedMunicipio,
    });
  }

  useEffect(() => {
    const process = async () => {
      try {
        setEstados(
          (
            await axios.get<IBGE[]>(
              "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
            )
          ).data.map(({ sigla, nome }) => {
            return { sigla, nome };
          }) || []
        );
      } catch (e) {
        setEstados([]);
      }
    };

    process();
  }, []);

  useEffect(() => {
    const process = async () => {
      try {
        if (selectedEstado) {
          setMunicipios(
            (
              await axios.get<IBGE[]>(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios?orderBy=nome`
              )
            ).data.map(({ nome }) => {
              return nome;
            }) || []
          );
        }
      } catch (e) {
        setMunicipios([]);
      }
    };

    process();
  }, [selectedEstado]);

  return (
    <ImageBackground source={background} style={styles.container}>
      <View style={styles.main}>
        <Image source={logo} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>
          Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente
        </Text>
      </View>

      <View style={styles.footer}>
        <RNPickerSelect
          style={pickerStyle}
          onValueChange={(value) => setSelectedEstado(value)}
          value={selectedEstado}
          items={estados.map((estado, key) => {
            return { label: estado.nome, value: estado.sigla };
          })}
          useNativeAndroidPickerStyle={false}
          Icon={() => <Icon name="arrow-right" color="#FFF" size={24} />}
        />
        <RNPickerSelect
          style={pickerStyle}
          value={selectedMunicipio}
          onValueChange={(value) => setSelectedMunicipio(value)}
          items={municipios.map((municipio, key) => {
            return { label: municipio, value: municipio };
          })}
          useNativeAndroidPickerStyle={false}
          Icon={() => <Icon name="arrow-right" color="#FFF" size={24} />}
        />
        <RectButton
          style={styles.button}
          onPress={() => {
            handleNavigateToPoints();
          }}
        >
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#FFF" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

const pickerStyle = {
  inputAndroid: {
    fontSize: 16,
    borderWidth: 0.5,
    borderColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    height: 60,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8, // to ensure the text is never behind the icon
  },
  placeholderColor: "#34CB79",
  underline: { borderTopWidth: 0 },
  iconContainer: {
    position: "absolute",
    backgroundColor: "transparent",
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderRightColor: "transparent",
    borderLeftWidth: 5,
    borderLeftColor: "transparent",
    width: 0,
    height: 0,
    top: 40,
    right: 15,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
});

export default Home;
