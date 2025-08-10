import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Event,
  Material,
  Badge,
  Mission,
  UserBadge,
  UserMission,
  EventParticipant,
} from "./types";

// Events
export async function createEvent(
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date();
  const docRef = await addDoc(collection(db, "events"), {
    ...eventData,
    date: Timestamp.fromDate(eventData.date),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return docRef.id;
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const docRef = doc(db, "events", eventId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Event;
  }
  return null;
}

export async function getEvents(): Promise<Event[]> {
  const q = query(collection(db, "events"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Event;
  });
}

export async function getEventsByOrganizer(
  organizerId: string
): Promise<Event[]> {
  const q = query(
    collection(db, "events"),
    where("organizerId", "==", organizerId),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Event;
  });
}

export async function updateEvent(eventId: string, eventData: Partial<Event>) {
  const docRef = doc(db, "events", eventId);
  const updateData: any = {
    ...eventData,
    updatedAt: Timestamp.fromDate(new Date()),
  };

  if (eventData.date) {
    updateData.date = Timestamp.fromDate(eventData.date);
  }

  await updateDoc(docRef, updateData);
}

// Event Participants
export async function joinEvent(userId: string, eventId: string) {
  const participantData = {
    userId,
    eventId,
    joinedAt: Timestamp.fromDate(new Date()),
  };

  // Add participant record
  await addDoc(collection(db, "eventParticipants"), participantData);

  // Update event participants array
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, {
    participants: arrayUnion(userId),
  });
}

export async function leaveEvent(userId: string, eventId: string) {
  // Remove from participants array
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, {
    participants: arrayRemove(userId),
  });

  // Remove participant record
  const q = query(
    collection(db, "eventParticipants"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.docs.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
}

export async function getUserEvents(userId: string): Promise<Event[]> {
  const q = query(
    collection(db, "eventParticipants"),
    where("userId", "==", userId)
  );
  const participantsSnapshot = await getDocs(q);

  const eventIds = participantsSnapshot.docs.map((doc) => doc.data().eventId);

  if (eventIds.length === 0) return [];

  const events: Event[] = [];
  for (const eventId of eventIds) {
    const event = await getEvent(eventId);
    if (event) events.push(event);
  }

  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Materials
export async function createMaterial(
  materialData: Omit<Material, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date();
  const docRef = await addDoc(collection(db, "materials"), {
    ...materialData,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return docRef.id;
}

export async function getMaterialsByEvent(
  eventId: string
): Promise<Material[]> {
  const q = query(
    collection(db, "materials"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Material;
  });
}

export async function getMaterial(
  materialId: string
): Promise<Material | null> {
  const docRef = doc(db, "materials", materialId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Material;
  }
  return null;
}

// Badges
export async function createBadge(badgeData: Omit<Badge, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, "badges"), {
    ...badgeData,
    createdAt: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
}

export async function getBadgesByEvent(eventId: string): Promise<Badge[]> {
  const q = query(
    collection(db, "badges"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as Badge;
  });
}

export async function getBadge(badgeId: string): Promise<Badge | null> {
  const docRef = doc(db, "badges", badgeId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as Badge;
  }
  return null;
}

// User Badges
export async function awardBadge(
  userId: string,
  badgeId: string,
  eventId: string,
  awardedBy: string
) {
  const userBadgeData = {
    userId,
    badgeId,
    eventId,
    awardedBy,
    awardedAt: Timestamp.fromDate(new Date()),
  };

  const docRef = await addDoc(collection(db, "userBadges"), userBadgeData);
  return docRef.id;
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const q = query(
    collection(db, "userBadges"),
    where("userId", "==", userId),
    orderBy("awardedAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      awardedAt: data.awardedAt.toDate(),
    } as UserBadge;
  });
}

// Missions
export async function createMission(
  missionData: Omit<Mission, "id" | "createdAt">
) {
  const docRef = await addDoc(collection(db, "missions"), {
    ...missionData,
    createdAt: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
}

export async function getMissionsByEvent(eventId: string): Promise<Mission[]> {
  const q = query(
    collection(db, "missions"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    } as Mission;
  });
}

// User Missions
export async function completeMission(
  userId: string,
  missionId: string,
  eventId: string
) {
  const userMissionData = {
    userId,
    missionId,
    eventId,
    completed: true,
    completedAt: Timestamp.fromDate(new Date()),
  };

  const docRef = await addDoc(collection(db, "userMissions"), userMissionData);
  return docRef.id;
}

export async function getUserMissions(
  userId: string,
  eventId: string
): Promise<UserMission[]> {
  const q = query(
    collection(db, "userMissions"),
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      completedAt: data.completedAt?.toDate(),
    } as UserMission;
  });
}
