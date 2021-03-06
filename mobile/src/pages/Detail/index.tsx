import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from "react-native";
import { Feather as Icon, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RectButton } from "react-native-gesture-handler";
import * as MailComposer from "expo-mail-composer";

import api from "../../services/api";
import Points from "pages/Points";

interface Params {
  point_id: number;
}

interface Point {
  id: number;
  name: string;
  image: string;
  email: string;
  whatsapp: string;
  city: string;
  uf: string;
}

interface Item {
  title: string;
}

const Detail: React.FC = () => {
  const [point, setPoint] = useState<Point>({} as Point);
  const [items, setItems] = useState<Item[]>([]);

  const navigation = useNavigation();
  const route = useRoute();

  const { point_id: id } = route.params as Params;

  useEffect(() => {
    async function proccess() {
      const {
        data: { point, items },
      } = await api.get(`/points/${id}`);
      setPoint(point);
      setItems(items);
    }
    proccess();
  }, []);

  function handleNavigateBack() {
    navigation.goBack();
  }

  function handleWhatsApp() {
    try {
      Linking.openURL(
        `whatsapp://send?phone=${point.whatsapp}&text=Tenho interesse sobre coleta de resíduos`
      );
    } catch (e) {
      console.log(e.message);
    }
  }

  function handleComposeMail() {
    MailComposer.composeAsync({
      subject: "Interesse na coleta de resíduos",
      recipients: [point.email],
    });
  }

  if (!point.id) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Image
          style={styles.pointImage}
          source={{
            uri: point.image,
          }}
        />

        <Text style={styles.pointName}>{point.name}</Text>
        <Text style={styles.pointItems}>
          {items.map((item) => item.title).join(", ")}
        </Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>
            {point.city} | {point.uf}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={() => handleWhatsApp()}>
          <FontAwesome name="whatsapp" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={() => handleComposeMail()}>
          <FontAwesome name="envelope" size={20} color="#FFF" />
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20,
  },

  pointImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: "#322153",
    fontSize: 28,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 24,
  },

  pointItems: {
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: "#6C6C80",
  },

  address: {
    marginTop: 32,
  },

  addressTitle: {
    color: "#322153",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },

  addressContent: {
    fontFamily: "Roboto_400Regular",
    lineHeight: 24,
    marginTop: 8,
    color: "#6C6C80",
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#999",
    paddingVertical: 20,
    paddingHorizontal: 32,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    width: "48%",
    backgroundColor: "#34CB79",
    borderRadius: 10,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    marginLeft: 8,
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_500Medium",
  },
});

export default Detail;
