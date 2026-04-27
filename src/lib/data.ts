import { prisma } from './prisma';

export interface Student {
  id: string;
  name: string;
  class: string;
  order: string;
  date: string;
}

export const getStudents = async (): Promise<Student[]> => {
  const students = await prisma.student.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return students.map((s) => ({
    id: s.id,
    name: s.name,
    class: s.class,
    order: s.order,
    date: s.createdAt.toISOString(),
  }));
};

export const addStudent = async (student: Omit<Student, 'id' | 'date'>): Promise<Student> => {
  const newStudent = await prisma.student.create({
    data: {
      name: student.name,
      class: student.class,
      order: student.order,
    },
  });

  return {
    id: newStudent.id,
    name: newStudent.name,
    class: newStudent.class,
    order: newStudent.order,
    date: newStudent.createdAt.toISOString(),
  };
};

export const getStudentsByDate = async (dateStr: string): Promise<Student[]> => {
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  const students = await prisma.student.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return students.map((s) => ({
    id: s.id,
    name: s.name,
    class: s.class,
    order: s.order,
    date: s.createdAt.toISOString(),
  }));
};
